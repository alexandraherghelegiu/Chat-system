let roomNo = null;
let name;
let socket = io({'force new connection': false});
let loadedImages;


/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';

    //Initialise small dropdown
    $('#smallDropdown').on('hide.bs.dropdown', function (e) {
        if (e.clickEvent) {
            e.preventDefault();
        }
    });

    //Initialise the name of the user
    name = window.localStorage.getItem("name");

    //setting name directly from local storage
    setName(name);

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

    // if image is new (not taken from MongoDB), then insert it in MongoDB
    if (!$("#img_title").prop("disabled")){
        //Check if image loaded or linked, only store in MongoDB if uploaded (if in base64 format)
        const base64regx = new RegExp("^data:image\\/(?:gif|png|jpeg|bmp|webp)(?:;charset=utf-8)?;" +
            "base64,(?:[A-Za-z0-9]|[+/])+={0,2}");
        if (base64regx.test(fullData.imageUrl)) {
            let mongoData = {
                "img_author": name,
                "img_title": fullData.imageTitle,
                "img_description": fullData.imageDesc,
                "imageBlob": fullData.imageUrl
            }
            let url = 'http://localhost:3000/insertMongo';
            sendInsertAjaxQueryToMongoDB(url, JSON.stringify(mongoData));
        }
    }
    sendAjaxFormQuery('/dashboard/processform', JSON.stringify(fullData));
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
 * Disconnects from a room by sending a request to /dashboard
 */
function disconnectFromRoom() {
    //Load dashboard
    sendAjaxQuery('http://localhost:3000/dashboard', ({name: name}));
}


/**
 * This function uploads an image and sets the image_url to the
 * image in base 64 format
 * @param file The image file
 */
function uploadImg(file, target){
    let targetElement = $("#"+target)
    var reader = new FileReader();
    reader.onloadend = function() {
        targetElement.val(reader.result);
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
    $("#"+inputField).val(newRoom);
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
    let messageLink = "<button class='btn btn-primary' " +
        "onclick='connectToRoomNew("+stringifiedData+")'>Connect to room "+dropdownFormData.roomid+"</button>";
    sendChatText(messageLink);

    //Redirects the current user
    sendFormData(formID);

    //Toggle menu
    $('#create-room-dropdown').click();
}


/**
 * Logs the current user out
 */
function logOut(){
    window.localStorage.clear();
    sendAjaxQuery('http://localhost:3000/');
}


/**
 * called when user clicks on "select from uploaded images"
 * sends query to server
 */
function getMongoImages() {
    sendGetAllAjaxQueryToMongoDB('/getAllMongo');
}


/**
 * displays all images in database
 * @param data retrieved from MongoDB
 */
function displayMongoImages(data) {
    let wrapper = document.getElementById('imageTileList');
    wrapper.innerHTML = "";
    wrapper.className = "container-fluid row";

    for (let image of data) {
        //display each image from MongoDB
        console.log(image.imageUrl);
        let tile = createTile(image, false);
        wrapper.appendChild(tile);
    }
    console.log(data);
}


/**
 * Filters the tiles according to its parameter
 * @param authorString The author's name
 */
function filterTiles(authorString){
    let filteredImages = loadedImages.filter(e => e.imageAuthor.toUpperCase().includes(authorString.toUpperCase()));
    displayMongoImages(filteredImages);
}


/**
 * Called at init to fill the user names correctly.
 */
function setName(n){
    $('#nameTitle').text('Welcome, ' + n);
    $('#who_you_are').text(n);
}
