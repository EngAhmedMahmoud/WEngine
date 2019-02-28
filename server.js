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
//Widget.getWidget("http://download2262.mediafire.com/stxoem78h5tg/k6453kpdzsi942a/camera_view.zip","camera_view");
//console.log(Widget.getWidgetConfiguration("camera_view"));
//console.log(Widget.checkDriverDependancy("camera_view"));
//console.log(Widget.checkWidgetDependancy("camera_view"));
console.log(Widget.checkEntryPoint("camera_view"));

//creating express application
const app = express();

app.listen(PORT,()=>{
    console.log(`Server is running at ${HOST}:${PORT}`);
});
