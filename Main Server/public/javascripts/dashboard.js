let roomNo = null;
let name;
let socket= io();

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    sendGetAllAjaxQueryToMongoDB('/getAllMongo');

    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';

    //Initialise the name of the user
    name = window.localStorage.getItem("name");

    //Initialise IndexedDB
    if ('indexedDB' in window) {
        initIDB().then(() => {
            //Display all room data stored in the indexedDB
            getAllRoomData(name).then(result => {
                if(result){
                    let wrapper = document.getElementById('roomTileList');
                    wrapper.className = "container-fluid row";

                    for(let room of result) {
                        //Checking whether annotations exist
                        let url;
                        if (room.canvas != "") url = room.canvas;
                        else url = room.imageUrl;

                        //Create the tile
                        let tile = createTile(url, room.imageTitle, room.imageDesc, room.author, true, room.roomid);

                        //Adding tile to wrapper
                        wrapper.appendChild(tile);
                    }
                }
            });
        });
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }

    //Initialise socket.io
    initSocket();
}

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
    roomNo = Math.round(Math.random() * 10000);
    document.getElementById('roomNo').value = 'R' + roomNo;
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText(text) {
    socket.emit('chat', roomNo, name, text);
}

/**
 * stores a newly created room in MongoDB
 * opens up the new room via connectToRoom method
 */
function createRoom(roomNr, imageUrl, title, desc){
    if(!imageUrl){
        alert('Image not specified');
        return;
    }
    if(!roomNr){
        alert('Room name not specified');
        return;
    }
    roomNo = roomNr;


    // check if image loaded or linked, only store in MongoDB if uploaded (if in base64 format)
    const base64regx = new RegExp("^data:image\\/(?:gif|png|jpeg|bmp|webp)(?:;charset=utf-8)?;" +
        "base64,(?:[A-Za-z0-9]|[+/])+={0,2}");
    if (base64regx.test(imageUrl)){
        let mongoData = {
            "img_author": name,
            "img_title": title,
            "img_description": desc,
            "imageBlob" : imageUrl
        }
        let url = 'https://localhost:3000/insertMongo';
        sendInsertAjaxQueryToMongoDB(url, JSON.stringify(mongoData));
    }

    console.log('connecting to ' + roomNr);
    connectToRoom(roomNo, imageUrl, title, desc, name);
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom(roomNr, imageUrl, title, desc, author) {

    roomNo = roomNr;
    console.log('connecting to ' + roomNr);

    //Checking the database
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
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnHistory(text) {
    if (text==='') return;
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    // scroll to the last element
    history.scrollTop = history.scrollHeight;
    document.getElementById('chat_input').value = '';
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('in_room').innerHTML= ' '+room;
}

/**
 * Disconnects from a room by sending a request to /dashboard
 */
function disconnectFromRoom(){
    //Load dashboard
    sendAjaxQuery('https://localhost:3000/dashboard', JSON.stringify({name: name}));
}

/**
 * Filters the tiles according to its parameter
 * @param authorString The author's name
 */
function filterTiles(authorString){
    //Display all room data stored in the indexedDB
    getAllRoomData(name).then(result => {
        if(result){
            //Filter results
            result = result.filter(e => e.author.toUpperCase().includes(authorString.toUpperCase()));

            let wrapper = document.getElementById('roomTileList');
            wrapper.className = "container-fluid row";
            //Clear tiles
            wrapper.innerHTML = "";

            for(let room of result) {
                //Checking whether annotations exist
                let url;
                if (room.canvas != "") url = room.canvas;
                else url = room.imageUrl;

                //Creating tile
                let tile = createTile(url, room.imageTitle, room.imageDesc, room.author, true, room.roomid);

                //Adding tile to wrapper
                wrapper.appendChild(tile);
            }
        }
    });
}

/**
 * Creates a tile containing an image, roomId and an author
 * @param imageUrl The image URL
 * @param title Title of the image
 * @param description Description of the image
 * @param author The author of the room
 * @param isRoom {Boolean} True if it is a room tile, false otherwise
 * @param roomId The room ID/name if isRoom is set to true
 * @returns {HTMLDivElement} A div HTML element
 */
function createTile(imageUrl, title, description, author, isRoom, roomId){
    let tile = document.createElement('div');
    tile.className = "col-12 col-sm-6 col-md-4 col-lg-2 card tile";
    tile.setAttribute("data-toggle", "tooltip");
    tile.setAttribute("title", "Description: " + description);
    $(tile).tooltip();

    let cardBody = document.createElement('div');
    cardBody.className = "card-body";

    let cardTitle = document.createElement('h5');
    cardTitle.className = "card-title";
    cardTitle.innerHTML = "Title: " + title;

    let cardRoom = document.createElement('p');
    cardRoom.className = "card-text";

    if(typeof roomId !== "undefined"){
        cardRoom.innerHTML = "Room name: " + roomId;
    }

    let cardAuthor = document.createElement('p');
    cardAuthor.className = "card-text";
    cardAuthor.innerHTML = "Author: " + author;

    let img = document.createElement('img');
    img.className = "card-img-top";
    img.src = imageUrl;

    cardBody.append(cardTitle, cardRoom, cardAuthor);
    tile.append(img, cardBody);

    //If it is a room
    if(isRoom){
        tile.addEventListener("click", () => {
            //Join the room
            connectToRoom(roomId, imageUrl, title, description, author);
        });
    }
    //If it is an image
    else{
        tile.setAttribute('tabindex', '0');
    }

    return tile;
}

/**
 * This function uploads an image and sets the image_url to the
 * image in base 64 format
 * @param file The image file
 */
function uploadImg(file, target){
    var reader = new FileReader();
    reader.onloadend = function() {
        target.value = reader.result;
    }
    reader.readAsDataURL(file);
}

/**
 * Generates a new room version
 * @param inputField HTML input field that displays the new room name
 */
function fillRoomNo(inputField){
    let newRoom = "";

    //Room already a continued version of another
    if(roomNo.lastIndexOf("-")>-1){
        let currentVersion =  roomNo.substr(roomNo.lastIndexOf("-")+1,roomNo.length+1);
        let roomWithoutVersion =  roomNo.substr(0,roomNo.lastIndexOf("-")+1);

        //If the string after "-" is a number
        if(!isNaN(parseFloat(currentVersion))){
            newRoom = roomWithoutVersion + (parseFloat(currentVersion)+1);
        }
        else{
            newRoom = roomWithoutVersion + "2";
        }
    }
    //Current room is the first room of the sequence
    else{
        newRoom = roomNo + "-2";
    }

    //Setting the value of the input field
    inputField.value = newRoom;
}


/**
 * Generates a link to the new room, and takes the user immediately to
 * the newly created room
 */
function generateRoomLink(){
    let room = $('#roomNoDD').val();
    let image_url = $('#new_image_url').val();
    let image_title = $('#new_img_title').val();
    let image_desc = $('#new_img_desc').val();

    //Field validation
    if(!image_url || !image_title || !image_desc){
        alert("Fill out the missing fields of the form!");
    }
    else{
        //Sends a button link to the new room to the chat
        let messageLink = `<button class="btn btn-primary" onclick="connectToRoom('${room}', 
                            '${image_url}'),'${image_title}','${image_desc}','${name}'">
                            Connect to room ${room}</button>`;
        sendChatText(messageLink);

        //Redirects the current user
        createRoom(room, image_url, image_title, image_desc);

        //Toggle menu
        $('#create-room-dropdown').click();
    }
}