let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/istruzioni', function(req, res, next) {
  res.render('istruzioni')
});

router.get('/downloads', function(req, res, next) {
  res.render('downloads');
});

router.get('/downloadPyInt', function(req, res, next) {
  res.download('python/intCamera.py');
});
router.get('/downloadPyExt', function(req, res, next) {
  res.download('python/extCamera.py');
});
router.get('/targz', function(req, res, next) {
  res.download('applications/severini.tar.gz')
});
router.get('/deb', function(req, res, next) {
  res.download('applications/severini.deb')
});
router.get('/zip', function(req, res, next) {
  res.download('applications/severini.zip')
});

module.exports = router;
