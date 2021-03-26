var express = require('express');
var router = express.Router();
// controller to make function calls to
const images = require('../controllers/images');
const initDB= require('../controllers/init');

initDB.init();  // delete the database (reinitialize) every run

// when a getAllImages GET request is sent, the router calls the controller
router.get('/getAllImages', images.getAllImages);

// when an insert POST request is sent, the router calls the controller
router.post('/insert', images.insert);

// GET home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
