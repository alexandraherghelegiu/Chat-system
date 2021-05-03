var isDrawing = false;
var startX;
var startY;

//Knowledge graph requirements
const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
const apiKey= 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM';

//KG result object
var resultObj;


/**
 * Initilaises the annotation canvas
 */
function annotationCanvasInit(){
    //Load current canvas
    let annotationCanvas = document.getElementById("annotationCanvas");
    let annotationCtx = annotationCanvas.getContext("2d");

    getRoomData(roomNo).then(room => {
        //Image to draw on canvas
        let img = document.getElementById("annotationImage");
        img.crossOrigin = "anonymous";

        //If canvas is saved
        if(room.canvas){
            img.src = room.canvas;
        }
        //If canvas isn't saved
        else{
            img.src = room.imageSrc;
        }

        img.addEventListener('load', () => {
            let poll = setInterval(() => {
                if(img.naturalHeight){
                    clearInterval(poll);

                    annotationCtx.width = annotationCanvas.width = img.width;
                    annotationCtx.height = annotationCanvas.height = img.height;

                    // //Resize canvas
                    // resizeCanvas(img, annotationCanvas, annotationCtx);

                    //Draw image on canvas
                    drawImageScaled(img, annotationCanvas, annotationCtx);
                    img.style.display = "none";
                }
            }, 10);
        });

        //Add listeners
        addListeners(img, annotationCanvas, annotationCtx);
    });
    $("#kgSearch").hide();

}
window.annotationCanvasInit = annotationCanvasInit;


/**
 * Adds the required listeners to the canvas
 */
function addListeners(image, canvas, ctx){
    /**
     * Handles the mousedown event
     * @param e the event
     */
    function handleMouseDown(e) {
        //Get mouse positions
        let mousePos = getMousePos(canvas, e);
        let mouseX = mousePos.x;
        let mouseY = mousePos.y;

        // If drawing
        if (isDrawing) {
            isDrawing = false;
            ctx.beginPath();
            ctx.rect(startX, startY, mouseX - startX, mouseY - startY);
            ctx.stroke();
            canvas.style.cursor = "default";

            //Makes KG searchbox appear
            widgetInit();
            $("#kgSearch").show();
        }
        // If not drawing
        else {
            isDrawing = true;
            startX = mousePos.x;
            startY = mousePos.y;
            canvas.style.cursor = "crosshair";
        }
    }

    /**
     * Handles the mousemove event
     * @param e the event
     */
    function handleMouseMove(e) {
        //Get mouse positions
        let mousePos = getMousePos(canvas, e);
        let mouseX = mousePos.x;
        let mouseY = mousePos.y;

        //Drawing rectangle
        if (isDrawing) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawImageScaled(image, canvas, ctx);
            ctx.beginPath();
            ctx.rect(startX, startY, mouseX - startX, mouseY - startY);
            ctx.stroke();
        }
    }

    //Adds listeners
    $("#annotationCanvas").mousedown(function (e) {
        handleMouseDown(e);
    });

    $("#annotationCanvas").mousemove(function (e) {
        handleMouseMove(e);
    });
}


/**
 * Gets the real mouse position on a canvas
 * @param canvas the canvas element
 * @param evt the event
 * @returns {{x: number, y: number}}
 */
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

/**
 * Initialises the KG widget
 */
function widgetInit(){
    let config = {
        'limit': 10,
        'languages': ['en'],
        'maxDescChars': 100,
        'selectHandler': selectItem,
    }
    KGSearchWidget(apiKey, document.getElementById("kgSearchInput"), config);
}


/**
 * callback called when an element in the widget is selected
 * @param event the Google Graph widget event {@link https://developers.google.com/knowledge-graph/how-tos/search-widget}
 */
function selectItem(event){
    //The result object
    resultObj = {
        name: event.row.name,
        id: event.row.id,
        description: event.row.rc,
        url: event.row.qc,
    }

    document.getElementById('resultId').innerText= 'id: '+resultObj.id;
    document.getElementById('resultName').innerText= resultObj.name;
    document.getElementById('resultDescription').innerText= resultObj.description;
    document.getElementById("resultUrl").href= resultObj.url;
    document.getElementById('kgResultPanel').style.display= 'block';

    //Pick different colours for different annotations
    document.getElementById('kgResultPanel').style.border= '1px solid black';
    document.getElementById('addAnnotationButton').disabled = false;
}


/**
 * Cleanup function for closing the modal window
 */
function closeAnnotationModal() {
    isDrawing = false;
    resultObj = undefined;
}
window.closeAnnotationModal = closeAnnotationModal;



function saveAnnotation(){
    //Save canvas as new canvas for the room
    //Set room's canvas src for the newly saved one
    //Save annotation in indexedDB (colour, name, description)
}
window.saveAnnotation = saveAnnotation;
