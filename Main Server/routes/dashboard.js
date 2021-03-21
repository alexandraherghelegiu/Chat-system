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

//POST the form data
router.post("/processform", (req, res, next) => {
   let body = req.body;
   res.writeHead(200, {"Content-Type": "application/json"});
   let data = JSON.stringify(body);
   res.end(data);
});

module.exports = router;

