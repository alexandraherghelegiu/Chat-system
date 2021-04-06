const Image = require('../models/images');
const imageToBase64 = require('image-to-base64');
const fs = require('fs');

// insert an image with all its details
// and export it so that it can be used outside the module
// TODO create a unique id for each image -> uniqueID.jpeg
exports.insert = function (req, res) {
    console.log("insert function called in Mongo server");
    let imageData = req.body;
    if (imageData == null) {
        res.status(403).send('No data sent!')
    }
    console.log(imageData);
    try {
        // make private directory for storing images
        let targetDirectory = './private/images/';
        if (!fs.existsSync(targetDirectory)) {
            fs.mkdirSync(targetDirectory,{recursive:true});
        }

        // strip off the data: url prefix to get just the base64-encoded bytes
        let imageBlob = imageData.imageSrc.replace(/^data:image\/\w+;base64,/, "");
        let buf = new Buffer(imageBlob, 'base64');
        // add image to private folder based on its base64 representation
        fs.writeFile(targetDirectory + imageData.imageTitle + '.jpeg', buf, function(err, result) {
            if(err) console.log('error', err);
        });

        // get the file path of the image in order to store it
        let filepath = targetDirectory + imageData.imageTitle + ".jpeg";

        // create database entry for the new Image
        let image = new Image({
            imagePath: filepath,
            author: imageData.author,
            imageTitle: imageData.imageTitle,
            imageDescription: imageData.imageDescription,
        });
        console.log('received: ' + image);

        // save the Image in the database
        image.save(function (err, results) {
            if (err)
                res.status(500).send('Invalid data!');
            else {
                res.send(JSON.stringify(image));
            }
        });
        console.log('image inserted into mongodb');
    } catch (e) {
        console.log('error in saving data: ' + e);
        res.status(500).send('error ' + e);
    }
}


// get all rooms, with all the image info associated with each room
exports.getAllImages = function (req, res) {
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }
    try {
        // get all images with their path, author, title and description from MongoDB
        Image.find({},
            'imagePath author imageTitle imageDescription',
            function (err, images) {
                if (err)
                    res.status(500).send('Invalid data!');
                let info = [];  // initialize list to send as response
                if (images.length > 0) {  // if database NOT empty
                    for (let image of images) {
                        // convert image file into base64 format
                        imageToBase64(image.imagePath).then(img=>{
                            let image_info = {
                                imageSrc: "data:image/jpeg;base64," + img,  // image in base64 format
                                author: image.author,
                                imageTitle: image.imageTitle,
                                imageDescription: image.imageDescription
                            };
                            // add this image info to the response list 'info'
                            info.push(image_info);
                            // once all the images have been pushed to 'info', send 'info' as response
                            if (info.length === images.length){
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify(info));
                            }
                        })
                            .catch(err=>console.log(err));
                    }
                }
                // if database is empty:
                else{
                    console.log("MongoDB is empty");  // let the console know
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(info));  // and just send an empty response
                }
            });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
}