const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    sender:{
        type: String,
        min:0,
        required:true
    },
    createdAt:{
        type:Date,
        default:()=> Date.now(),
        immutable:true
    }
})

module.exports = mongoose.model("Message",messageSchema)