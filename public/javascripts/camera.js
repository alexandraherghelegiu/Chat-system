var videoStream;

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
            videoStream = stream;
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
        $('#previewGroup').show();
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


function uploadTakenImage(){
    let photo = $('#photoTaken').attr('src');
    $('#image_url').val(photo);
    //Stopping the stream
    stopStream(videoStream);
    $('#cameraInterface').hide();
}
