//import mongoose
const mongoose =require('mongoose');
const { stringify } = require('nodemon/lib/utils');
//generate schema
const platSchema = mongoose.Schema({
    platName : String,
    price : String,
    description : String,
    idChef : String

});

//generate model user
const plat =mongoose.model("Plat",platSchema);
//export model 
module.exports =plat;
