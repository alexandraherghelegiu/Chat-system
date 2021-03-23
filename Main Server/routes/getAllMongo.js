var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');


router.get('/', function(req, res, next) {
    fetch('http://localhost:3001/getAllImages', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
    })
        .then (res => res.json())
        .then (data => console.log(data))
        .catch(err =>
            console.log(err))
});

module.exports = router;
