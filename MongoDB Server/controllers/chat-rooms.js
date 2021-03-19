const Chat_room = require('../models/chat-rooms');
const imageToBase64 = require('image-to-base64');
const fs = require('fs');

// insert a chat room
// and export it so that it can be used outside the module
exports.insert = function (req, res) {
    console.log("insert function called in Mongo server");
    let roomData = req.body;
    if (roomData == null) {
        res.status(403).send('No data sent!')
    }
    console.log(roomData);
    try {
        // save image in private directory
        let targetDirectory = '../private/images/';
        if (!fs.existsSync(targetDirectory)) {
            fs.mkdirSync(targetDirectory);
        }
        console.log('saving file ' + targetDirectory);
        // strip off the data: url prefix to get just the base64-encoded bytes
        let imageBlob = roomData.imageBlob.replace(/^data:image\/\w+;base64,/, "");
        let buf = new Buffer(imageBlob, 'base64');

        fs.writeFile(targetDirectory + roomData.img_title + '.jpeg', buf, function(err, result) {
                if(err) console.log('error', err);
            });

        // get the file path
        let filepath = targetDirectory + roomData.img_title;

        // create database entry for the new chat room
        let chat_room = new Chat_room({
            room_id: roomData.room_id,
            image_path: filepath,
            image_author: roomData.img_author,
            image_title: roomData.img_title,
            image_description: roomData.img_description,
        });
        console.log('received: ' + chat_room);

        // save the chat room in the database
        chat_room.save(function (err, results) {
            if (err)
                res.status(500).send('Invalid data!');
            else {
                //res.writeHead(200, {"Content-Type:": "application/json"});
                console.log("-------");
                console.log(JSON.stringify(chat_room));
                res.send(JSON.stringify(chat_room));
            }
        });
        console.log('image inserted into mongodb');
    } catch (e) {
        console.log('error in saving data: ' + e);
        res.status(500).send('error ' + e);
    }
}


// get all rooms, with all the image info associated with each room
exports.getAllRooms = function (req, res) {
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        Chat_room.find({},
            'room_id image_path image_author image_title image_description',
            function (err, rooms) {
                if (err)
                    res.status(500).send('Invalid data!');
                let info = [];
                if (rooms.length > 0) {
                    for (room of rooms) {
                        let image = imageToBase64("path/to/file.jpg");
                        let room_info = {
                            room_id: room.room_id,
                            image: image,
                            img_author: room.image_author,
                            img_title: room.image_title,
                            img_description: room.image_description
                        };
                        info.push(room_info);
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(info));
                }
                // what if database is empty:
                else{
                    console.log("MongoDB is empty");
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(null));
                }
            });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
}