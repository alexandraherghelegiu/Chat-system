let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let Chat_room = new Schema(
    {
        room_id: {type: String, required: true},
        image_path: {type: String, required: true},
        image_author: {type: String, required: true},
        image_title: {type: String},
        image_description: {type: String},
        whatever: {type: String} //any other field
    }
);

Chat_room.set('toObject', {getters: true});

let chatroomModel = mongoose.model('Chat Room', Chat_room);

module.exports = chatroomModel;
