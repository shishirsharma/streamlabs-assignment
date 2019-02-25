var express = require('express');
var router = express.Router();

module.exports = function(app, logger, mongo) {

    /* GET users listing. */
    router.get('/', function(req, res, next) {
        res.send('respond with a resource');
    });

    router.get('/subscribe', function(req, res, next) {
        res.send('respond with a resource');
    });

    app.use('/users', router);

    //module.exports = router;
};
