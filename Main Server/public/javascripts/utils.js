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
 * Creates an annotation tile
 * @param annotationObject
 */
function createAnnotationTile(annotationObject){
     console.log(annotationObject)
    //The tile
    let tile = document.createElement("div");
    let borderString = "3px solid "+annotationObject.color;
    tile.style.border = borderString;
    tile.className = "w-100 mb-1 p-1";

    //Name
    let name = document.createElement("h3");
    name.innerHTML = annotationObject.name;

    //ID
    let id = document.createElement("h4");
    id.innerHTML = "id: "+annotationObject.id;

    //Description
    let description = document.createElement("div");
    description.innerHTML = annotationObject.description;

    //Link
    let link = document.createElement("a");
    link.target = "_blank";
    link.href = annotationObject.url;
    link.innerHTML = "Link to Webpage";

    tile.append(name, id, description, link);
    return tile;
}
window.createAnnotationTile = createAnnotationTile;


/**
 * Refreshes the list of annotations in the room
 * @param roomNr the room id
 */
function refreshAnnotations(roomNr){
    let container = document.getElementById("annotationList");
    //Reset
    container.innerHTML = "";

    //Get annotations
    getAnnotations(roomNr).then(annotationList => {

        if(annotationList){
            //Show panel
            container.style.display = "block";
            console.log("Annotation list: ", annotationList)
            //Adding tiles to the container
            for(let a of annotationList){
                let tile = createAnnotationTile(a);
                container.appendChild(tile);
            }
        }
        else{
            //Hide panel
            container.style.display = "none";
        }
    });
}
window.refreshAnnotations = refreshAnnotations;


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


