const Image = require('../models/images');
const imageToBase64 = require('image-to-base64');
const fs = require('fs');

// insert an image with all its details
// and export it so that it can be used outside the module
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
        let imageBlob = imageData.imageBlob.replace(/^data:image\/\w+;base64,/, "");
        let buf = new Buffer(imageBlob, 'base64');
        // add image to private folder based on its base64 representation
        fs.writeFile(targetDirectory + imageData.img_title + '.jpeg', buf, function(err, result) {
            if(err) console.log('error', err);
        });

        // get the file path of the image in order to store it
        let filepath = targetDirectory + imageData.img_title + ".jpeg";

        // create database entry for the new Image
        let image = new Image({
            image_path: filepath,
            image_author: imageData.img_author,
            image_title: imageData.img_title,
            image_description: imageData.img_description,
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
            'image_path image_author image_title image_description',
            function (err, images) {
                if (err)
                    res.status(500).send('Invalid data!');
                let info = [];  // initialize list to send as response
                if (images.length > 0) {  // if database NOT empty
                    for (let image of images) {
                        // convert image file into base64 format
                        imageToBase64(image.image_path).then(img=>{
                            let image_info = {
                                imageUrl: "data:image/jpeg;base64," + img,  // image in base64 format
                                imageAuthor: image.image_author,
                                imageTitle: image.image_title,
                                imageDesc: image.image_description
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