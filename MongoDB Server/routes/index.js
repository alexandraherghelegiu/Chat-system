var express = require('express');
var router = express.Router();
const chat_room = require('../controllers/chat-rooms');

const initDB= require('../controllers/init');
initDB.init();


router.get('/getAllRooms', chat_room.getAllRooms);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/insert', chat_room.insert);

module.exports = router;
