"use strict";
const fs = require("fs");
const http = require("http");
class Widget{
    getWidget(url,fileName){
        var tmpFilePath = "tmp/" + fileName + ".zip";
        
        request(url, function(err, resp, body){
            if(err) throw err;
            fs.writeFile(outputFile, body, function(err) {
              console.log("file written!");
            });
        });
    }
}
var widgetInterface = new Widget();
module.exports = widgetInterface;