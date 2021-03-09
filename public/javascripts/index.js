let name = null;

function enterSystem() {
    name = document.getElementById('name').value;
    if (!name) name = 'Unknown-' + Math.random();
    const data = {name: name};
    sendAjaxQuery('/dashboard', JSON.stringify(data));
    event.preventDefault();
}
