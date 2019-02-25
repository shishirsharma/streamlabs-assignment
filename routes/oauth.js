var express = require('express');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request = require('request');
var router = express.Router();
const assert = require('assert');
const queryString = require('query-string');
var debug = require('debug')('router:oauth');

module.exports = function(app, logger, mongodb, passport) {
  debug('mongodb object', mongodb);
  let db = mongodb.db;

  // Override passport profile function to get user profile from Twitch API
  OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
    var options = {
      url: 'https://api.twitch.tv/helix/users',
      method: 'GET',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Authorization': 'Bearer ' + accessToken
      }
    };

    request(options, function (error, response, body) {
      if (response && response.statusCode == 200) {
        done(null, JSON.parse(body));
      } else {
        done(JSON.parse(body));
      }
    });
  };

  passport.serializeUser(function(user, done) {
    // debug('serializeing', user);
    // mongodb.db.collection('users').insertOne(user, function(err, r) {
    //     assert.equal(null, err);
    //     assert.equal(1, r.insertedCount);
    //     debug('serializedUser', r.insertedCount, user);
    //     done(null, user);
    // });
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    // debug('deserializeUser', user);
    // mongodb.db.collection('users').findOneAndUpdate({
    //     id: user.id,
    //     login: user.login
    // }, user, {
    //     returnOriginal: false,
    //     // sort: [[a,1]],
    //     upsert: true
    // }, function(err, r) {
    //     assert.equal(null, err);
    //     debug('deserializeUser', r);
    //     assert.equal(1, r.length);
    //     done(null, r.value);
    // });
    done(null, user);
  });

  passport.use('twitch', new OAuth2Strategy({
    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    state: true
  }, function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;

    // Securely store user profile in your DB
    //User.findOrCreate(..., function(err, user) {
    //  done(err, user);
    //});
    debug('passport profile ', profile);
    let user = profile.data[0];
    user.accessToken = profile.accessToken;
    user.refreshToken = profile.refreshToken;
    user.ts = require('moment')().format();

    // mongodb.db.collection('users').insertOne(user, function(err, r) {
    //     assert.equal(null, err);
    //     assert.equal(1, r.insertedCount);
    //     debug('serializedUser', r.insertedCount, r.value);
    //     done(null, profile);
    // });

    mongodb.db.collection('users').findOneAndUpdate({
      id: user.id,
      login: user.login
    }, {
      $set: user
    }, {
      returnOriginal: false,
      // sort: [[a,1]],
      upsert: true
    }, function(err, r) {
      assert.equal(null, err);
      debug('mongo callback reponse', r);
      assert.equal(1, r.ok);
      // done(null, r.value);
      done(null, profile);
    });
    // done(null, profile);
  }));

  var handler = {
    index: function(req, res, next) {
      debug('called index');
      res.render('oauth/index', { title: 'Express', layout: 'login_layout'});
    },
    twitch: function(req, res, next) {
      debug('called twitch');
      passport.authenticate('twitch', {
        scope: 'user_read'
      })(req, res, next);
      debug('finishd twitch');
      // logger.info('bla bla');
      // res.render('oauth/index', { title: 'Express', layout: 'login_layout'});
    },
    callback: function(req, res, next) {
      debug('called callback');
      passport.authenticate('twitch', {
        successRedirect: '/oauth/redirect',
        failureRedirect: '/'
      })(req, res, next);
      // res.send('respond with a resource');
      // res.render('oauth/index', { title: 'Express' });
    },
    redirect: function(req, res, next) {
      let user = req.user;
      debug('called redirect', user);

      let params = {};
      params.accessToken = user.accessToken;
      params.login = user.data[0].login;
      params.display_name = user.data[0].display_name;
      const stringified = queryString.stringify(params);
      let url = process.env.WEBAPP_REDIRECT_URL + '?' + stringified ;

      // res.send('respond with a resource');
      // res.render('oauth/index', { title: 'Express' });

      debug('Redirecting to url:', url);
      res.redirect(url);
    }
  };

  debug('Configured /oauth/login url');
  /* GET users listing. */
  router.get('/', handler.index);

  debug('Configured /oauth/login url');
  /* GET users listing. */
  // router.get('/twitch', handler.twitch);
  router.get('/twitch', passport.authenticate('twitch', {
    scope: 'user_read'
  }));

  debug('Configured /oauth/oauth url');
  /* GET users listing. */
  router.get('/callback', handler.callback);

  debug('Configured /oauth/oauth url');
  /* GET users listing. */
  router.get('/redirect', handler.redirect);

  debug('Configured /oauth router');
  app.use('/oauth', router);

  //module.exports = router;
};
