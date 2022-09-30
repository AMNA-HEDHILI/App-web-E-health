//import mongoose
const mongoose =require('mongoose');
//generate schema
const userSchema = mongoose.Schema({
    firstName : String,
    lastName : String,
    email : String,
    password : String,
    tel :String,
    role  :String,
    Experience: String,
    Speciality:String,
    DateofBirth:String
});

//generate model user
const user =mongoose.model("User",userSchema);
//export model 
module.exports =user;
