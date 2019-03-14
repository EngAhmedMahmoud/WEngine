"use strict";
require("dotenv/config");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const widgetRouter = require("./router")
const DB_CONNECTION = require("./utils/DatabaseConnection");
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST;
const WidgetEngine = require("./WidgetInterface");
const installedWidgetsPath = path.join(__dirname,"installed");
//init connection
DB_CONNECTION.connection;

//creating express application
const app = express();
app.set('view engine', 'pug');
app.set("views", [path.join(__dirname, "views")]);

//static files for custom pages by widgetName
WidgetEngine.installedWidgets(installedWidgetsPath)
.then((data)=>{
   if(data.success==1){
       let widgets = data.installedWidgets;
       widgets.forEach(widget => {
            app.use(`/${widget}`,express.static(path.join(__dirname,"installed",widget,"assets")));
       });
   }
})
.catch((error)=>{
    console.log(error);
});
//

app.use(express.static(path.join(__dirname,"public")));
app.use('/backup',express.static(path.join(__dirname,"backup")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/",widgetRouter);

app.listen(PORT,()=>{
    console.log(`Server is running at ${HOST}:${PORT}`);
});
