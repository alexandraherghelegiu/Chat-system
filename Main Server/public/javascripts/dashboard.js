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
                        //Create the tile
                        let tile = createTile(room, true);

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
 * Initialises the socket
 */
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
 * Sends the form data to the server
 * @param formID The ID of the form
 */
function sendFormData(formID) {
    //Getting form data
    let form = document.getElementById(formID);
    let formData = serialiseForm(form);

    //Check for missing url/roomid
    if(!formData.roomid || !formData.imageUrl){
        alert("Room name and Image are required!");
        return;
    }

    //Extra fields
    let extraData = {
        "accessedBy": name,
        "canvas": "",
        "messages": []
    }

    //Data to send
    let fullData = {...formData, ...extraData}

    sendAjaxFormQuery('/dashboard/processform', JSON.stringify(fullData));
}


/**
 * Extracts data from a given form
 * @param form {HTMLElement} The form element
 * @returns {{}} The data as an object
 */
function serialiseForm(form){
    var formArray = $(form).serializeArray();
    var data = {};

    for (index in formArray){
        data[formArray[index].name]= formArray[index].value;
    }

    return data;
}


/**
 * Connects to a room and saves it if it is new
 * @param roomData The room data
 */
function connectToRoomNew(roomData) {
    var data = roomData;
    roomNo = roomData.roomid

    //Check if image loaded or linked, only store in MongoDB if uploaded (if in base64 format)
    const base64regx = new RegExp("^data:image\\/(?:gif|png|jpeg|bmp|webp)(?:;charset=utf-8)?;" +
        "base64,(?:[A-Za-z0-9]|[+/])+={0,2}");
    if (base64regx.test(data.imageUrl)){
        let mongoData = {
            "img_author": name,
            "img_title": data.imageTitle,
            "img_description": data.imageDesc,
            "imageBlob" : data.imageUrl
        }
        let url = 'https://localhost:3000/insertMongo';
        sendInsertAjaxQueryToMongoDB(url, JSON.stringify(mongoData));
    }

    console.log('connecting to ' + data.roomid);
    //Checking the database
    getRoomData(roomNo).then(result => {
        //If it is a new room
        if(!result){
            //Store the data in indexedDB
            storeRoomData(data);
            //Open socket and display chat
            socket.emit('create or join', roomNo, data.accessedBy, data.imageUrl);
            displayLoadedMessages([]);
            hideLoginInterface(roomNo, data.accessedBy);
            initCanvas(socket, data.imageUrl, "");
        }

        //If room already exists
        else{
            //Open socket
            socket.emit('create or join', result.roomid, result.accessedBy, result.imageUrl);
            //Load data from indexedDB
            displayLoadedMessages(result.messages);
            //Display chat
            hideLoginInterface(result.roomid, result.accessedBy);
            initCanvas(socket, result.imageUrl, result.canvas);
        }
    });
}

/**
 * Creates a tile(card) HTML element
 * @param data The image or room data
 * @param isRoom {Boolean} True if room, false if image
 * @returns {HTMLDivElement}
 */
function createTile(data, isRoom){
    let tile = document.createElement('div');
    tile.className = "col-12 col-sm-6 col-md-4 col-lg-2 card tile";

    //General fields
    let cardBody = document.createElement('div');
    cardBody.className = "card-body";

    let cardTitle = document.createElement('h5');
    cardTitle.className = "card-title";


    let img = document.createElement('img');
    img.className = "card-img-top";
    //If annotations exist
    if(data.canvas) img.src = data.canvas;
    //No annotations
    else img.src = data.imageUrl;


    //If it is a room
    if(isRoom){
        //Event listener
        tile.addEventListener("click", () => {
            //Join the room
            connectToRoomNew(data);
        });

        //Additional field(s)
        cardTitle.innerHTML = "Room: " + data.roomid;

        cardBody.appendChild(cardTitle);
    }
    //If it is an image
    else{
        //Description in tooltip
        tile.setAttribute("data-toggle", "tooltip");
        tile.setAttribute("title", "Description: " + data.imageDesc);
        $(tile).tooltip();

        //Make it selectable
        tile.setAttribute('tabindex', '0');

        //Additional field(s)
        cardTitle.innerHTML = "Title: " + data.imageTitle;

        let cardAuthor = document.createElement('p');
        cardAuthor.className = "card-text";
        cardAuthor.innerHTML = "Author: " + author;

        cardBody.append(cardTitle, cardAuthor)

    }

    //Add image and card body
    tile.append(img, cardBody);
    return tile;
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
    // TODO: Need to filter images rather than rooms!

    //Display all room data stored in the indexedDB
    // getAllRoomData(name).then(result => {
    //     if(result){
    //         //Filter results
    //         result = result.filter(e => e.author.toUpperCase().includes(authorString.toUpperCase()));
    //
    //         let wrapper = document.getElementById('roomTileList');
    //         wrapper.className = "container-fluid row";
    //         //Clear tiles
    //         wrapper.innerHTML = "";
    //
    //         for(let room of result) {
    //             //Checking whether annotations exist
    //             let url;
    //             if (room.canvas != "") url = room.canvas;
    //             else url = room.imageUrl;
    //
    //             //Creating tile
    //             let tile = createTile(url, room.imageTitle, room.imageDesc, room.author, true, room.roomid);
    //
    //             //Adding tile to wrapper
    //             wrapper.appendChild(tile);
    //         }
    //     }
    // });
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
function generateRoomLink(formID){
    //Load form data
    let dropdownForm = document.getElementById("dropdown-create-room");
    let dropdownFormData = serialiseForm(dropdownForm);

    //Sends a button link to the new room to the chat
    var stringifiedData = JSON.stringify(dropdownFormData);
    let messageLink = "<button class='btn btn-primary' onclick='connectToRoomNew("+stringifiedData+")'>Connect to room "+dropdownFormData.roomid+"</button>";
    sendChatText(messageLink);

    //Redirects the current user
    sendFormData(formID);

    //Toggle menu
    $('#create-room-dropdown').click();
}

/**
 * Toggles the title and description fields in the form if
 * the user wants to join to an existing room
 */
function toggleFormFields(){
    let checkbox = $("#box-1");
    let titleField = $("#img_title");
    let descField = $("#img_description");

    //Disable title and description fields
    if(checkbox.is(":checked")){
        titleField.prop("disabled", true);
        descField.prop("disabled", true);
    }
    //Enable title and description fields
    else{
        titleField.prop("disabled", false);
        descField.prop("disabled", false);
    }
}