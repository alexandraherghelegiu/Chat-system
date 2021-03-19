let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let Image = new Schema(
    {
        image_path: {type: String, required: true},
        image_author: {type: String, required: true},
        image_title: {type: String},
        image_description: {type: String}
        //whatever: {type: String} //any other field
    }
);

Image.set('toObject', {}, 'bufferCommands: false');

let imageModel = mongoose.model('Image', Image);

module.exports = imageModel;
