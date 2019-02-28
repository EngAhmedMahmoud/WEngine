"use strict";
require("dotenv/config");
const express = require("express");
const DB_CONNECTION = require("./utils/DatabaseConnection");
const Widget = require("./WidgetInterface");
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST;

//init connection
DB_CONNECTION.connection;
//widget 
Widget.getWidget("http://download938.mediafire.com/dzid4kfylgsg/z53ir31six2x8tl/layout_widget.zip")
//creating express application
const app = express();

app.listen(PORT,()=>{
    console.log(`Server is running at ${HOST}:${PORT}`);
});