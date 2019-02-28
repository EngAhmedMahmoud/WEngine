"use strict";
require("dotenv/config");
const express = require("express");

const DB_CONNECTION = require("./utils/DatabaseConnection");
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST;

//init connection
DB_CONNECTION.connection;

//creating express application
const app = express();

app.listen(PORT,()=>{
    console.log(`Server is running at ${HOST}:${PORT}`);
});