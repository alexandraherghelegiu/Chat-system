let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// define data format within the db
let Image = new Schema(
    {
        imagePath: {type: String, required: true},
        author: {type: String, required: true},
        imageTitle: {type: String},
        imageDescription: {type: String}
    }
);

Image.set('toObject', {}, 'bufferCommands: false');

let imageModel = mongoose.model('Image', Image);

module.exports = imageModel;
