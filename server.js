"use strict";
require("dotenv/config");
const express = require("express");
const bodyParser = require("body-parser");
const widgetRouter = require("./router")
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
//console.log(Widget.checkEntryPoint("camera_view"));
//console.log(Widget.saveWidget("camera_view"));
//console.log(Widget.listDependantDrivers(["driver1","driver2"],"camera_view"));
//console.log(Widget.listDependantDrivers(["camera_driver","dell_driver"],"camera_view"));
console.log(Widget.validateWidgetHierarcy("camera_view"));

//creating express application
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/",widgetRouter);

app.listen(PORT,()=>{
    console.log(`Server is running at ${HOST}:${PORT}`);
});
