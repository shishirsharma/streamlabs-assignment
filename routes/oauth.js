var express = require('express');
var router = express.Router();
var debug = require('debug')('router:oauth');

module.exports = function(app, logger, mongo) {

    var handler = {
        login: function(req, res, next) {
            logger.info('bla bla');
            res.render('oauth/index', { title: 'Express', layout: 'login_layout'});
        },
        oauth: function(req, res, next) {
            res.send('respond with a resource');
            res.render('oauth/index', { title: 'Express' });
        }
    };

    debug('Configured /oauth/login url');
    /* GET users listing. */
    router.get('/login', handler.login);

    debug('Configured /oauth/oauth url');
    /* GET users listing. */
    router.get('/oauth', handler.oauth);

    app.use('/oauth', router);

    //module.exports = router;
};
