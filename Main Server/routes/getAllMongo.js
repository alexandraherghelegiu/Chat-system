var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');


router.get('/', function(req, res, next) {
    fetch('http://localhost:3001/getAllRooms', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
    })
        .then (res => console.log(res))
        .catch(err =>
            console.log(err))
});

module.exports = router;
