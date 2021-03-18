var express = require('express');
var router = express.Router();
const chat_room = require('../controllers/chat-rooms');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/insert', chat_room.insert);

module.exports = router;
