var offline = false;

/**
 * Initialises the socket
 */
function initSocket(){
    //Listening for joined room confirmation
    socket.on('joined', function(room, userId, image){
        if(userId != name){
            writeOnHistory('<b>' + userId + '</b>' + ' joined room ' + room);
        }
    });

    //Listening for chat in the room
    socket.on('chat', function (room, userId, chatText){
        //Send message
        sendAndSaveMessage(room, userId, chatText);
    });

    //Listening for network errors
    socket.on('connect_error', (error) => {
        console.log("You are offline");
        //if offline the website blocks certain fields
        statusOffline();
    })

    //Listening for successful connection to server
    socket.on('connect', () => {
        console.log("You are online");
        statusOnline();
        //when going reconnecting need to resubscribe to the room
        socket.emit('create or join', roomNo, name, '');
    })
}


/**
 * Connects to a room and saves it if it is new
 * @param roomData The room data
 */
function connectToRoomNew(roomData) {
    var data = roomData;
    roomNo = roomData.roomID

    //Checking the database
    getRoomData(roomNo).then(result => {
        //If it is a new room
        if(!result){
            //Store the data in indexedDB
            storeRoomData(data);
            //Open socket and display chat
            socket.emit('create or join', roomNo, data.accessedBy, data.imageSrc);
            displayLoadedMessages([]);
            hideLoginInterface(roomNo, data.accessedBy);
            initCanvas(socket, data.imageSrc, "");
        }

        //If room already exists
        else{
            //Open socket
            socket.emit('create or join', result.roomID, result.accessedBy, result.imageSrc);
            //Load data from indexedDB
            displayLoadedMessages(result.messages);
            //Display chat
            hideLoginInterface(result.roomID, result.accessedBy);
            initCanvas(socket, result.imageSrc, result.canvas);
        }
    });
}


/**
 * Displays the loaded messages on the history
 * @param messageList List of message objects
 */
function displayLoadedMessages(messageList){
    let history = document.getElementById('history');
    //Clear history
    history.innerHTML = "";

    for(let m of messageList){
        let paragraph = document.createElement('p');

        //If user the current user
        if(m.user.trim() === name.trim()){
            paragraph.innerHTML = '<b>Me:</b> ' + m.message;
        }
        else{
            paragraph.innerHTML = '<b>' + m.user + ':</b> ' + m.message;
        }
        //Append to the history
        history.appendChild(paragraph);
    }
    //Scroll to the last element
    history.scrollTop = history.scrollHeight;
    document.getElementById('chat_input').value = '';
}


/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText(text) {
    //Check connection status
    if(offline){
        //Send message offline
        sendAndSaveMessage(roomNo, name, text);
    }
    else{
        //Emit to socket.io
        socket.emit('chat', roomNo, name, text);
    }
}


/**
 * Called when user is online
 */
function statusOnline(){
    offline = false;
    $('#create-room-dropdown').prop('disabled', false);
    $('#offlineIcon').hide();
    $('#connect').prop('disabled', false);
}


/**
 * Called when user goes offline
 */
function statusOffline(){
    offline = true;
    $('#create-room-dropdown').prop('disabled', true);
    $('#offlineIcon').show();
    $('#connect').prop('disabled', true);
}


/**
 * Sends a chat message, then saves it in indexedDB
 * @param room The ID of the room
 * @param user The name of the user
 * @param message The message content
 */
function sendAndSaveMessage(room, user, message){
    //Write on chat
    let who = user;
    if (user === name) who = 'Me';
    writeOnHistory('<b>' + who + ':</b> ' + message);

    //Storing message in IndexedDB
    getRoomFieldData(room, "messages").then(data => {
        var newObj = {
            date: Date(),
            user: user,
            message: message
        }
        data.push(newObj);
        updateField(room, "messages", data);
    });
}