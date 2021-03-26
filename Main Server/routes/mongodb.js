var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');


router.get('/getAll', function(req, res, next) {
    fetch('http://localhost:3001/getAllImages', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
    })
        .then (res => res.json())
        .then (data => res.send(data))
        .catch(err =>
            console.log(err))
});


router.post('/insertImage', function(req, res, next) {
    let data = req.body;
    console.log(data);
    fetch('http://localhost:3001/insert', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'},
    })
        .then (res => res.text())
        .then (data=> console.log(data))
        .catch(err =>
            console.log(err))
});


module.exports = router;
