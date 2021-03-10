let roomNo = null;
let socket= io();

window.onload = init();
/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';


    //initialise IndexedDB
    //check for support
    if ('indexedDB' in window) {
        initIDB();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }

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
function connectToRoom() {
    roomNo = document.getElementById('roomNo').value;
    let imageUrl= document.getElementById('image_url').value;
    //@todo join the room

    //Inserting data into the database
    storeRoomData({"roomid": roomNo, "author": name, "imageUrl" : imageUrl, "canvas": "", "messages": []});

    // getAllRoomData().then(e => console.log(e));

    //joins room only if image provided
    if (imageUrl) {
        socket.emit('create or join', roomNo, name, imageUrl);
        hideLoginInterface(roomNo, name);
        initCanvas(socket, imageUrl);
    } else {
        alert('image not specified');
    }
}

function initSocket(){
    socket.on('joined', function(room, userId, image){
        if (userId === name){

            hideLoginInterface(room, userId);
        } else {

            writeOnHistory('<b>' + userId + '</b>' + ' joined room ' + room);
        }
    });

    socket.on('chat', function (room, userId, chatText){
        let who = userId;
        if (userId === name) who = 'me';
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
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
}


function setupCamera(){
    //document.getElementById('initial_form').style.display = 'none';
    document.getElementById('cameraInterface').style.display = 'block';

    var width = 320;
    var height = 0;
    var streaming = false;
    let video = document.getElementById('video');
    let photo = document.getElementById('photoTaken');
    let shutter = document.getElementById('shutter');
    let preview = document.getElementById('preview');
    let retake = document.getElementById('retake');

    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function (err) {
            console.log("An error occurred: " + err);
        });

        video.addEventListener('canplay', function(ev){
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth/width);

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                preview.setAttribute('width', width);
                preview.setAttribute('height', height);
                streaming = true;
            }
        }, false);

        shutter.addEventListener('click', function(e){
            takePicture();
            $('.camera').hide();
            $('#preview').hide();
            $('#retake').show();
            $('#photoTaken').show();
            $('#confirm').show();
            e.preventDefault();


        }, false);

        retake.addEventListener('click', function(e){
            clearPhoto();
            $('.camera').show();
            //$('#preview').show();
            $('#photoTaken').hide();
            $('#retake').hide();
            $('#confirm').hide();
        })


    function takePicture(){
        let context = preview.getContext('2d');
        if (width && height) {
            preview.width = width;
            preview.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = preview.toDataURL('image/png');
            photo.setAttribute('src', data);

        } else {
            clearPhoto();
        }
    }

    function clearPhoto(){
        let context = preview.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0,0, preview.width, preview.height);
        let data = ($('#preview')[0]).toDataURL();
        photo.setAttribute('src', data);

    }

}

function closeCamera(){
    //document.getElementById('initial_form').style.display = 'block';
    document.getElementById('cameraInterface').style.display = 'none';

}


function uploadTakenImage(){
    let photo = $('#photoTaken').attr('src');
    $('#image_url').val(photo);
    $('#connect').click();
}



