var express = require('express');
var router = express.Router();

var name;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('dashboard', { name: name });
});

router.get('/', function(req, res, next) {
    name = req.body.name;
    res.render('dashboard', { name: name });
});

module.exports = router;

