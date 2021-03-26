var videoStream;

/**
 * Function setupCamera enables the camera interface, enables the live camera feed
 * and allows for taking and retaking pictures with a camera as well as upload them
 * when creating a new room.
 * @param inRoom checks if the camera is started from within a room
 */

function setupCamera(inRoom){
    //Camera interface appears
    document.getElementById('cameraInterface').style.display = 'block';

    //Setting up variables for the camera
    var width = 320;
    var height = 0;
    var streaming = false;
    let video = document.getElementById('video');
    let photo = document.getElementById('photoTaken');
    let shutter = document.getElementById('shutter');
    let preview = document.getElementById('preview');
    let retake = document.getElementById('retake');

    //Gets video feed from user devices
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function (stream) {
            videoStream = stream;
            video.srcObject = stream;
            video.play();
        })
        .catch(function (err) {
            console.log("An error occurred: " + err);
        });

    //Video stream is shown on the canvas
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

    //On click of the shutter a still frame is attached to the preview canvas and
    //other interface buttons are hidden
    shutter.addEventListener('click', function(e){
        takePicture();
        $('#previewGroup').show();
        $('#shutter').hide();
        $('.camera').hide();
        $('#preview').hide();
        $('#retake').show();
        $('#photoTaken').show();
        if(inRoom) $('#confirmSmall').show();
        else $('#confirm').show();
        e.preventDefault();


    }, false);

    //Retake button
    retake.addEventListener('click', function(e){
        clearPhoto();
        $('.camera').show();
        $('#shutter').show();
        $('#photoTaken').hide();
        $('#retake').hide();
        $('#confirm').hide();
        $('#confirmSmall').hide()
    })


    //Draws the current frame displayed by the video onto a canvas of the size specified
    //earlier
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

    //Clears the photo chosen so that it can be retaken
    function clearPhoto(){
        let context = preview.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0,0, preview.width, preview.height);
        let data = ($('#preview')[0]).toDataURL();
        photo.setAttribute('src', data);

    }

}

//stops the camera and hides the interface
function closeCamera(){
    //Stopping the stream
    stopStream(videoStream);
    //document.getElementById('initial_form').style.display = 'block';
    document.getElementById('cameraInterface').style.display = 'none';

}

/**
 * Function for closing the video stream
 * @param stream The video stream
 */
function stopStream(stream) {
    stream.getTracks()[0].stop();
}

/**
 *Function uploadTakenImage uploads whatever image was taken
 * last and attaches it to the object with target id
 * @param target
 */
function uploadTakenImage(target){
    let photo = $('#photoTaken').attr('src');
    $('#'+target).val(photo);
    //Stopping the stream
    stopStream(videoStream);
    $('#cameraInterface').hide();
}

