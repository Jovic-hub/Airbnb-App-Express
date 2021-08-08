/*
Student: Joao Victor Fernandes dos Santos
StudentId: jvfernandes-dos-sant
Student Numbeer: 155858194
Course: WEB 322 
Professor: George Kougioumtzoglou
*/
const mongoose = require('mongoose')
require("dotenv").config()

let key = process.env.KEY;
mongoose.connect(key,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const roomSchema = mongoose.Schema({
    title:{type:String, required: true},
    price:{ type:String, required:true },
    description:{ type:String, required:true },
    location:{ type:String, required:true },
    email:{type: String, required:true},
    photo:{ type:String},
})

const roomModel = mongoose.model('rooms',roomSchema);

module.exports = roomModel;