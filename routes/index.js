var express = require('express');
var router = express.Router();

var name;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Spy System' });
});

module.exports = router;
