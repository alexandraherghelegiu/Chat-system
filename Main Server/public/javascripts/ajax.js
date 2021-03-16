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