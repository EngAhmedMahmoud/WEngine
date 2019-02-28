"use strict";
require("dotenv/config");
const mongoose = require("mongoose");
const DB_URL = process.env.DB_URL;
class DbConnection{
    constructor(){
        if(!this.dbcon){
            this.dbcon = this.init();
            return this.dbcon;
        }
    }
    init(){
        mongoose.connect(DB_URL,{useNewUrlParser: true,useCreateIndex:true}).then((dbcon)=>{
               console.log("Connection Created Successfully");
            }).catch((error)=>{
                console.log("Error in connection");
            });
    }
}
var dbconnect = new DbConnection();
exports.connection = dbconnect;