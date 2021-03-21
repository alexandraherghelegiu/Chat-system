function sendAjaxQuery(url, data){
    $.ajax({
        url: url,
        type: "GET",
        data: data,
        contentType: 'application/json',
        //Error function
        error: err => console.log(err),
        //Success function
        success: response => {
            //Redirect
            location = url;
        }
    });
}

function sendInsertAjaxQueryToMongoDB(url, data){
    $.ajax({
        url: url,
        type: "POST",
        data: data,
        contentType: 'application/json',
        //Error function
        error: err => console.log(err),
        //Success function
        success: response => {
            console.log("insert request succeeded");
        }
    });
}

function sendGetAllAjaxQueryToMongoDB(url){
    $.ajax({
        url: url,
        type: "GET",
        contentType: 'application/json',
        client_max_body_size: 100,
        //Error function
        error: err => console.log(err),
        //Success function
        success: response => {
            loadedImages = response;
            displayMongoImages(response);
            // change to display results
            console.log("Get all request succeeded");
        }
    });
}

/**
 * Sends an AJAX query containing the form data
 * @param url The target url
 * @param data The data extracted from the form
 */
function sendAjaxFormQuery(url, data){
    $.ajax({
        url: url,
        data: data,
        contentType: "application/json",
        type: "POST",
        success: data => {
            connectToRoomNew(data);
        },
        error: (xhr, status, error) => {
            alert("Error: "+error.message);
        }
    })
}