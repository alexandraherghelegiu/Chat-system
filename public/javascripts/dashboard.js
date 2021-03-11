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
                let wrapper = document.getElementById('roomTileList');

                for(let room of result){
                    let tile = document.createElement('div');
                    tile.className = "tile";
                    tile.style.border = "solid black";

                    let entry = document.createElement('p');
                    entry.innerHTML = room.roomid + ", created by " + room.author;

                    let img = document.createElement('img');
                    img.className = "thumbnail";
                    img.src = room.imageUrl;
                    tile.append(entry, img);

                    tile.addEventListener("click", () => {
                        //Join the room
                        connectToRoom(room.roomid, room.imageUrl);
                    })

                    wrapper.appendChild(tile);
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
    roomNo = roomNr;
    //let imageUrl= document.getElementById('image_url').value;

    //Checking the database
    getRoomData(roomNo, "imageUrl").then(result => {
            if(!result){
                //If it is a new room
                if(!imageUrl){
                    alert('Image not specified');
                }
                else{
                    storeRoomData({"roomid": roomNo, "author": name, "imageUrl" : imageUrl, "canvas": "", "messages": []});
                    socket.emit('create or join', roomNo, name, imageUrl);
                    hideLoginInterface(roomNo, name);
                    initCanvas(socket, imageUrl);
                }
            }
            else{
                //If room already exists
                socket.emit('create or join', roomNo, name, result);
                hideLoginInterface(roomNo, name);
                initCanvas(socket, result);
            }
    });
}

function initSocket(){
    socket.on('joined', function(room, userId, image){
        if (userId === name){
            console.log(name);
            hideLoginInterface(room, userId);
        } else {

            writeOnHistory('<b>' + userId + '</b>' + ' joined room ' + room);
        }
    });

    socket.on('chat', function (room, userId, chatText){
        let who = userId;
        if (userId === name) who = 'me';
        let canvasUrl = document.getElementById('canvas').toDataURL();

        //Storing message in IndexedDB
        getRoomData(room, "messages").then(data => {
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





