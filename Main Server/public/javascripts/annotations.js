var isDrawing = false;
var startX;
var startY;


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
                }
            }, 10);
        });

        //Add listeners
        addListeners(img, annotationCanvas, annotationCtx);
    });

    //Pick different colours for different annotations
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
            //TRIGGERS KG SEARCHBOX'S APPEARANCE
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

function saveAnnotation(){
    //Save canvas as new canvas for the room
    //Set room's canvas src for the newly saved one
    //Save annotation in indexedDB (colour, name, description)
}
window.saveAnnotation = saveAnnotation;
