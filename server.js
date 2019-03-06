"use strict";
require("dotenv/config");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const widgetRouter = require("./router")
const DB_CONNECTION = require("./utils/DatabaseConnection");
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST;

//init connection
DB_CONNECTION.connection;

//creating express application
const app = express();
app.set('view engine', 'pug');
app.set("views", [path.join(__dirname, "views")]);

app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/",widgetRouter);

app.listen(PORT,()=>{
    console.log(`Server is running at ${HOST}:${PORT}`);
});
