var express = require('express');
var cors = require('cors')
var router = express.Router();
const { WebHook } = require('twitch-toolkit');
var debug = require('debug')('router:webhooks');

module.exports = function(app, logger, mongo) {

    // client_secret: process.env.TWITCH_CLIENT_SECRET,
    const twitchWebHook = new WebHook({
        clientId: process.env.TWITCH_CLIENT_ID,
        callbackUrl: process.env.EVENT_CALLBACK_URL
    });

    //Add stream Up/Down event listener.
    twitchWebHook.on('stream_up_down', function(data) {
        if (data.length !== 0) {
            debug('Stream is up!');
        } else {
            debug('Stream just went down!');
        }
    });

    //Add user follow event listener.
    twitchWebHook.on('user_follows', function(data) {
        for (let i in data) {
            debug('New Follower with id ' + data[i]['from_id']);
        }
    });


    /* GET users listing. */
    router.get('/', function(req, res, next) {
        res.send('respond with a resource');
    });

    router.options('/subscribe', cors()) 
    router.get('/subscribe', cors(), function(req, res, next) {
        let user_id = req.query.user_id;
        debug('user_id', user_id)
        debug(req.headers)
        // console.log(req);
        //res.send('respond with a resource');
        //let topic = 'https://api.twitch.tv/helix/users/follows';
        twitchWebHook.topicUserFollowsSubscribe(null, user_id)
    });

    router.get('/callback', function(req, res, next) {
        let result = twitchWebHook.handleRequest('GET', req.headers, req.query, req.body);
        res.sendStatus(result.status);
    });
    router.post('/callback', function(req, res, next) {
        let result = twitchWebHook.handleRequest('POST', req.headers, req.query, req.body);
        res.sendStatus(result.status);
    });

    app.use('/webhooks', router);

    //module.exports = router;
};
