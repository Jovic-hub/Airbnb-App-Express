/*
Student: Joao Victor Fernandes dos Santos
StudentId: jvfernandes-dos-sant
Student Numbeer: 155858194
Course: WEB 322 
Professor: George Kougioumtzoglou
*/
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
require("dotenv").config()

let key = process.env.KEY;
mongoose.connect(key,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const userSchema = mongoose.Schema({
    username:{type:String, unique:true, required: true},
    password:{ type:String, required:true }
})

userSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function(plaintext, callback) {
    return callback(null, bcrypt.compareSync(plaintext, this.password));
};

const userModel = mongoose.model('users',userSchema)

module.exports = userModel