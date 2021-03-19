function sendAjaxQuery(url, data){
    $.ajax({
        url: url,
        type: "POST",
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

function sendGetAllAjaxQueryToMongoDB(url, data){
    $.ajax({
        url: url,
        type: "POST",
        data: data,
        contentType: 'application/json',
        //Error function
        error: err => console.log(err),
        //Success function
        success: response => {
            // change to display results
            console.log("insert request succeeded");
        }
    });
}