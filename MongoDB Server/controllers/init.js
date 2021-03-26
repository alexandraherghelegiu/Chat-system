const mongoose = require('mongoose');
const images = require('../models/images');


exports.init= function() {
    // uncomment if you need to drop the database
    images.remove({}, function(err) {
        console.log('collection removed')
    });
}
