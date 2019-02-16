var express = require('express');
var router = express.Router();
var debug = require('debug')('router:oauth');

module.exports = function(app, logger) {

    var handler = {
        login: function(req, res, next) {
            logger.info('bla bla');
            res.send('respond with a resource');
        },
        oauth: function(req, res, next) {
            res.send('respond with a resource');
        }
    };

    debug('Configured /login url');
    /* GET users listing. */
    router.get('/login', handler.login);

    app.use('/oauth', router);

    //module.exports = router;
};
