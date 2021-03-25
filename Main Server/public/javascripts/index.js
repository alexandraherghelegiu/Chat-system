let name = null;

function init(){
    //initialise IndexedDB
    //check for support
    if ('indexedDB' in window) {
        initIDB();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
}

function enterSystem() {
    name = document.getElementById('name').value;
    if (!name) name = 'Unknown-' + Math.random();
    const data = {name: name};

    //Set local storage
    window.localStorage.setItem("name", name);

    sendAjaxQuery('http://localhost:3000/dashboard', (data));
    event.preventDefault();
}

if ('serviceWorker' in navigator){
    window.addEventListener('load', function(){
        navigator.serviceWorker.register('/service-worker.js').then(function(registration){
            //Registration successful
            console.log("service worker registered successfully with scope "+ registration.scope);
        }, function(err){
            console.log("service worker registration error: " + err);
        });
    });
}
