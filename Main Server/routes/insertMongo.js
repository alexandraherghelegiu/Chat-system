var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');


router.post('/', function(req, res, next) {
    let data = req.body;
    console.log(data);
    fetch('http://localhost:3001/insert', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'},
    })
        .then (res => console.log(res))
        .catch(err =>
            console.log(err))
});

module.exports = router;
