
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
    })
    //Add listeners
    //Pick different colours for different annotations
}
window.annotationCanvasInit = annotationCanvasInit;

function saveAnnotation(){
    //Save canvas as new canvas for the room
    //Set room's canvas src for the newly saved one
    //Save annotation in indexedDB (colour, name, description)
}
window.saveAnnotation = saveAnnotation;
