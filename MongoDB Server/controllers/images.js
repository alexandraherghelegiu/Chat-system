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
        // save image in private directory
        let targetDirectory = '../private/images/';
        if (!fs.existsSync(targetDirectory)) {
            fs.mkdirSync(targetDirectory);
        }
        console.log('saving file ' + targetDirectory);
        // strip off the data: url prefix to get just the base64-encoded bytes
        let imageBlob = imageData.imageBlob.replace(/^data:image\/\w+;base64,/, "");
        let buf = new Buffer(imageBlob, 'base64');

        fs.writeFile(targetDirectory + imageData.img_title + '.jpeg', buf, function(err, result) {
            if(err) console.log('error', err);
        });

        // get the file path
        let filepath = targetDirectory + imageData.img_title + ".jpeg";

        // create database entry for the new chat room
        let image = new Image({
            image_path: filepath,
            image_author: imageData.img_author,
            image_title: imageData.img_title,
            image_description: imageData.img_description,
        });
        console.log('received: ' + image);

        // save the chat room in the database
        image.save(function (err, results) {
            if (err)
                res.status(500).send('Invalid data!');
            else {
                //res.writeHead(200, {"Content-Type:": "application/json"});
                console.log("-------");
                console.log(JSON.stringify(image));
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
        Image.find({},
            'image_path image_author image_title image_description',
            function (err, images) {
                if (err)
                    res.status(500).send('Invalid data!');
                let info = [];
                if (images.length > 0) {
                    for (let image of images) {
                        console.log("images in db length > 0");
                        imageToBase64(image.image_path).then(img=>{
                            let image_info = {
                                imageUrl: "data:image/jpeg;base64," + img,  // image in base64 format
                                imageAuthor: image.image_author,
                                imageTitle: image.image_title,
                                imageDesc: image.image_description
                            };
                            info.push(image_info);
                            if (info.length === images.length){
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify(info));
                            }
                        })
                            .catch(err=>console.log(err));
                    }
                }
                // what if database is empty:
                else{
                    console.log("MongoDB is empty");
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(info));
                }
            });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
}