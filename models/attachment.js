const mongoose = require('mongoose');

const attachment = new mongoose.Schema({
    filename : {
        type: String ,
        required: true
    },
    size : {
        type: String
    },
    type : {
        type: String
    },
    created_at : {
         type: Date, 
         default: Date.now 
    }
})

const Attachment = mongoose.model('Attachment', attachment);
module.exports = Attachment;