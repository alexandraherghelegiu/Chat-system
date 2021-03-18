var express = require('express');
var router = express.Router();
const chat_room = require('../controllers/chat-rooms');

const initDB= require('../controllers/init');
initDB.init();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/insert', chat_room.insert);

router.post('/getAllRooms', chat_room.getAllRooms);

module.exports = router;
