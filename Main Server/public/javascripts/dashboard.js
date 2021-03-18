let roomNo = null;
let name;
let socket= io();


/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';

    //Initialise the name of the user
    name = document.getElementById("who_you_are").textContent;

    //Initialise IndexedDB
    if ('indexedDB' in window) {
        initIDB().then(() => {
            //Display all room data stored in the indexedDB
            getAllRoomData().then(result => {
                if(result){
                    let wrapper = document.getElementById('roomTileList');
                    wrapper.className = "container-fluid row";

                    for(let room of result) {
                        //Checking whether annotations exist
                        let url;
                        if (room.canvas != "") url = room.canvas;
                        else url = room.imageUrl;

                        //Create the tile
                        let tile = createTile(url, room.roomid, room.author);

                        //Add tooltip if description exists
                        if(room.imageDesc){
                            $(tile).attr("data-toggle", "tooltip");
                            $(tile).attr("title", "Description: "+room.imageDesc);
                            $(tile).tooltip();
                        }

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
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    // @todo send the chat message
    socket.emit('chat', roomNo, name, chatText);
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom(roomNr, imageUrl) {
    //sendAjaxQuery('https://localhost:3000/dashboard', JSON.stringify({name: name}));

    roomNo = roomNr;
    console.log('connecting to ' + roomNr);
    //let imageUrl= document.getElementById('image_url').value;

    //Checking the database
    getRoomData(roomNo).then(result => {
            if(!result){
                //If it is a new room
                if(!imageUrl){
                    alert('Image not specified');
                    return;
                }
                if(!roomNr){
                    alert('Room name not specified');
                    return;
                }
                else{
                    let title = document.getElementById("img_title").value;
                    let desc = document.getElementById("img_description").value;
                    storeRoomData({
                        "roomid": roomNo,
                        "author": name,
                        "imageUrl" : imageUrl,
                        "imageTitle" : title,
                        "imageDesc" : desc,
                        "canvas": "",
                        "messages": []
                    });
                    socket.emit('create or join', roomNo, name, imageUrl);
                    hideLoginInterface(roomNo, name);
                    initCanvas(socket, imageUrl, "");
                }
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
    getAllRoomData().then(result => {
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
                let tile = createTile(url, room.roomid, room.author);

                //Adding tile to wrapper
                wrapper.appendChild(tile);
            }
        }
    });
}

/**
 * Creates a tile containing an image, roomId and an author
 * @param imageUrl The image URL
 * @param roomId The room ID/name
 * @param author The author of the room
 * @returns {HTMLDivElement} A div HTML element
 */
function createTile(imageUrl, roomId, author){
    let tile = document.createElement('div');
    tile.className = "col-12 col-sm-6 col-md-4 col-lg-2 card tile";

    let cardBody = document.createElement('div');
    cardBody.className = "card-body";

    let cardTitle = document.createElement('h5');
    cardTitle.className = "card-title";
    cardTitle.innerHTML = "Room name: " + roomId;

    let cardAuthor = document.createElement('p');
    cardAuthor.className = "card-text";
    cardAuthor.innerHTML = "Author: " + author;

    let img = document.createElement('img');
    img.className = "card-img-top";
    img.src = imageUrl;

    cardBody.append(cardTitle, cardAuthor);
    tile.append(img, cardBody);

    tile.addEventListener("click", () => {
        //Join the room
        connectToRoom(roomId, imageUrl);
    });

    return tile;
}

/**
 * This function uploads an image and sets the image_url to the
 * image in base 64 format
 * @param file The image file
 */
function uploadImg(file){
    var reader = new FileReader();
    reader.onloadend = function() {
        let textField = document.getElementById("image_url");
        textField.value = reader.result;
    }
    reader.readAsDataURL(file);
}


function fillRoomNo(){
    $('#roomNoDD').val(roomNo);
}

function generateRoomLink(){
    let room = $('#roomNoDD').val();
    let image_url = $('#new_image_url').val();
    let image_title = $('#new_img_title').val();
    let current_input = $('#chat_input').val();
    if (room === roomNo)
        room = room + '+' + Math.floor(Math.random() * 100);
    $('#chat_input').val(current_input + (`<button onclick="connectToRoom('${room}', '${image_url}')">${image_title}</button>`));
    //initCanvas();
    //sendAjaxQuery('https://localhost:3000/dashboard', JSON.stringify({name: name}));
}

