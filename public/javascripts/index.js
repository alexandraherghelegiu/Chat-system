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
    sendAjaxQuery('http://localhost:3000/dashboard', JSON.stringify(data));
    event.preventDefault();
}