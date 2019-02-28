"use strict";
require("dotenv/config");
const express = require("express");
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST;


//creating express application
const app = express();

app.listen(PORT,HOST,()=>{
    console.log(`Server is running at${HOST}:${PORT}`);
});