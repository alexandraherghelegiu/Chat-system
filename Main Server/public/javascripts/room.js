function initSocket(){
    //Joining a room
    socket.on('joined', function(room, userId, image){
        if(userId != name){
            writeOnHistory('<b>' + userId + '</b>' + ' joined room ' + room);
        }
    });

    //Sending chat in room
    socket.on('chat', function (room, userId, chatText){
        let who = userId;
        if (userId === name) who = 'Me';
        let canvasUrl = document.getElementById('canvas').toDataURL();

        //Storing message in IndexedDB
        getRoomFieldData(room, "messages").then(data => {
            var newObj = {
                date: Date(),
                user: userId,
                message: chatText
            }
            data.push(newObj);
            updateField(room, "messages", data);
        });
        updateField(room, "canvas", canvasUrl);

        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });
}


/**
 * Function called when connecting to a room
 * Takes the room, imageUrl, image title, desc and author as parameters
 */
function connectToRoom(roomNr, imageUrl, title, desc, author) {
    let roomNo = roomNr;

    //Checking the local database if room already stored
    getRoomData(roomNo).then(result => {
        if(!result){
            //If it is a new room
            storeRoomData({
                "roomid": roomNo,
                "author": author,
                "accessedBy": name,
                "imageUrl" : imageUrl,
                "imageTitle" : title,
                "imageDesc" : desc,
                "canvas": "",
                "messages": []
            });

            //Request room join to socketIO
            socket.emit('create or join', roomNo, name, imageUrl);
            displayLoadedMessages([]);
            hideLoginInterface(roomNo, name);
            initCanvas(socket, imageUrl, "");
        }

        //If room already exists
        else{
            socket.emit('create or join', roomNo, name, result.imageUrl);
            //Load data from indexedDB
            displayLoadedMessages(result.messages);
            hideLoginInterface(roomNo, name);
            initCanvas(socket, result.imageUrl, result.canvas);
        }
    });
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText(text) {
    socket.emit('chat', roomNo, name, text);
}