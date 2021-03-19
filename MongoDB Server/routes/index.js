var express = require('express');
var router = express.Router();
const images = require('../controllers/images');

const initDB= require('../controllers/init');
initDB.init();


router.get('/getAllImages', images.getAllImages);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/insert', images.insert);

module.exports = router;
