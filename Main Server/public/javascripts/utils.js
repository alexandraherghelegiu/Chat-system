/**
 * Extracts data from a given form
 * @param form {HTMLElement} The form element
 * @returns {{}} The data as an object
 */
function serialiseForm(form){
    var formArray = $(form).serializeArray();
    var data = {};

    for (let index in formArray){
        data[formArray[index].name]= formArray[index].value;
    }
    return data;
}
window.serialiseForm = serialiseForm;


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
    else img.src = data.imageSrc;

    //If it is a room
    if(isRoom){
        //Event listener
        tile.addEventListener("click", () => {
            //Join the room
            connectToRoomNew(data);
        });

        //Additional field(s)
        cardTitle.innerHTML = "Room: " + data.roomID;
        cardBody.appendChild(cardTitle);
    }

    //If it is an image
    else{
        tile.setAttribute("data-dismiss", "modal");
        tile.addEventListener("click", () => {
            //Join the room
            $("#image_url").val(img.src);
        });

        //Description in tooltip
        tile.setAttribute("data-toggle", "tooltip");
        tile.setAttribute("title", "Description: " + data.imageDescription);
        $(tile).tooltip();

        //Make it selectable
        tile.setAttribute('tabindex', '0');

        //Additional field(s)
        cardTitle.innerHTML = "Title: " + data.imageTitle;

        let cardAuthor = document.createElement('p');
        cardAuthor.className = "card-text";
        cardAuthor.innerHTML = "Author: " + data.author;

        cardBody.append(cardTitle, cardAuthor)
    }
    //Add image and card body
    tile.append(img, cardBody);
    return tile;
}
window.createTile = createTile;


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
window.hideLoginInterface = hideLoginInterface;


/**
 * Toggles the title and description fields in the form if
 * the user wants to join to an existing room
 */
function toggleFormFields(){
    let checkbox = $("#box-1");
    let titleField = $("#img_title");
    let descField = $("#img_description");
    let imgBrowseBtn = $("#pickImage");
    let imgUploadBtn = $("#img_upload_btn");
    let takePictureBtn = $("#takePicture");
    let generateRoomBtn = $("#roomNoGenerator");

    //Disable title and description fields
    if(checkbox.is(":checked")){
        generateRoomBtn.prop("disabled", true);
        imgUploadBtn.prop("disabled", true);
        takePictureBtn.prop("disabled", true);
        titleField.prop("disabled", true);
        descField.prop("disabled", true);
    }
    //Enable title and description fields
    else{
        generateRoomBtn.prop("disabled", false);
        imgUploadBtn.prop("disabled", false);
        takePictureBtn.prop("disabled", false);
        titleField.prop("disabled", false);
        descField.prop("disabled", false);
    }
}
window.toggleFormFields = toggleFormFields;


