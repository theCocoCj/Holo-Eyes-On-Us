let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
    res.render('indexPlay');
});

router.get('/calibrazione', function(req, res, next) {
    res.render('calibrazione');
});

router.get('/pianoBase', function(req, res, next) {
    res.render('pianoBase');
});

router.get('/piano', function(req, res, next) {
    res.render('piano');
});

module.exports = router;