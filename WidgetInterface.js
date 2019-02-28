"use strict";
const fs = require("fs");
class Widget{
    getWidget(url){
        let splittedUrl = url.split("/");
        let outputFile = splittedUrl.pop();
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