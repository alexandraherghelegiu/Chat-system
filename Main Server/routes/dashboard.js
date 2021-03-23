var express = require('express');
var router = express.Router();
var name;


router.get('/', function(req, res, next) {
    let body = req.query;
    if(body.name)
        name = body.name;
    console.log(name);
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

