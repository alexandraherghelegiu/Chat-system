const Chat_room = require('../models/chat-rooms');

// insert a chat room
// and export it so that it can be used outside the module
exports.insert = function (req, res) {
    let roomData = req.body;
    if (roomData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        // save image in private directory
        let targetDirectory = './private/images/' + roomData.image_author + '/';
        if (!fs.existsSync(targetDirectory)) {
            fs.mkdirSync(targetDirectory);
        }
        console.log('saving file ' + targetDirectory);
        // strip off the data: url prefix to get just the base64-encoded bytes
        let imageBlob = roomData.imageBlob.replace(/^data:image\/\w+;base64,/,
            "");
        let buf = new Buffer(imageBlob, 'base64');
        fs.writeFile(targetDirectory + roomData.img_title + '.png', buf);
        // get the file path
        let filepath = targetDirectory + roomData.img_title;

        // create database entry for the new chat room
        let chat_room = new Chat_room({
            room_id: roomData.room_id,
            image_path: filepath,
            image_author: roomData.img_author,
            image_title: roomData.img_title,
            image_description: roomData.img_description
        });
        console.log('received: ' + chat_room);

        // save the chat room in the database
        chat_room.save(function (err, results) {
            console.log(results._id);
            if (err)
                res.status(500).send('Invalid data!');

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(chat_room));
        });
        console.log('image inserted into db');
    } catch (e) {
        console.log('error in saving data: ' + e);
        res.status(500).send('error ' + e);
    }
}

