"use strict";
const fs = require("fs");
const http = require("http");
const zipUnzipPackage = require("adm-zip");

class Widget{
    //url must be http and accurate path to zip file 
    getWidget(url,fileName){
        var tmpFilePath = "tmp/" + fileName + ".zip";
        http.get(url,(response)=>{
            response.on("data",(data)=>{
                fs.appendFileSync(tmpFilePath,data);
            });
            response.on("end",(data)=>{
                var widgetZipFile = new zipUnzipPackage(tmpFilePath);
                widgetZipFile.extractAllTo("installed/"+fileName);
                fs.unlinkSync(tmpFilePath);
            });
        });
    }
    validateWidget(widgetName){
        //check hierarchy
        //check dependancy 
        //check  
    }
    getWidgetConfiguration(widgetName){
        var configFile = `installed/${widgetName}/config.json`;
        var configurations = JSON.parse(fs.readFileSync(configFile,"UTF-8"));
        return configurations;
    }
    checkDriverDependancy(widgetName){
        const dependancyDrivers = this.getWidgetConfiguration(widgetName).dep_drivers;
        const driverPath = `installed/${widgetName}/driver_dep`;
        const dependancyDriversCount = dependancyDrivers.length;

        if(dependancyDrivers){
            let driverExist = {};
            let drivers = [];
            if (fs.existsSync(driverPath)) {
                for(let i = 0; i<dependancyDriversCount;i++){
                    let driver = dependancyDrivers[i].variable_name;
                    let depDriverPath = `${driverPath}/${driver}.json`;
                    if(!fs.existsSync(depDriverPath)){
                        driverExist.success=0;
                        drivers.push(driver);
                        driverExist.drivers = drivers;
                    }
                }
                if(driverExist.success===0){
                    return driverExist;
                }else{
                    return {success:1};
                }
               
            }
        }
    }
    checkWidgetDependancy(widgetName){
        const dependancyWidgets = this.getWidgetConfiguration(widgetName).dep_widgets;
        const widgetPath = `installed/${widgetName}/widget_dep`;
        if(dependancyWidgets){
            if (fs.existsSync(widgetPath)) {
                dependancyWidgets.forEach((Widget)=>{
                    let depWidgetPath = `${widgetPath}/${Widget.variable_name}.json`;
                    if(!fs.existsSync(depWidgetPath)){
                        return {success:0,dep_drivers:driver.variable_name,msg:"Not Exist"};
                    }
                });
            }
        }
    }
}
var widgetInterface = new Widget();
module.exports = widgetInterface;