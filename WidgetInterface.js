"use strict";
const fs = require("fs");
const http = require("http");
const zipUnzipPackage = require("adm-zip");
const Widget = require(""); 

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
                        driverExist.errors = drivers;
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
        const dependancyWidgetsCount = dependancyWidgets.length;

        if(dependancyWidgets){
            let widgetExist = {};
            let widgets = [];
            if (fs.existsSync(widgetPath)) {
                for(let i = 0; i<dependancyWidgetsCount;i++){
                    let widget = dependancyDrivers[i].variable_name;
                    let depWidgetPath = `${widgetPath}/${widget.variable_name}.json`;

                    if(!fs.existsSync(depWidgetPath)){
                        widgetExist.success=0;
                        widgets.push(driver);
                        driverExist.errors = widgets;
                    }
                }
                if(widgetExist.success === 0){
                    return widgetExist;
                }else{
                    return {success:1};
                }
               
            }
        }
    }
    checkEntryPoint(widgetName){
        const entryPoint = this.getWidgetConfiguration(widgetName).entry_point;
        const entryPath = `installed/${widgetName}/views`;
        let entryPointExist = {};
        let errors =[];
        if (fs.existsSync(entryPath)){
            let entryPintPath = `${entryPath}/${entryPoint}`;
            if(!fs.existsSync(entryPintPath)){
                entryPointExist.success=0;
                errors.push(entryPoint);
                entryPointExist.errors = errors;
            }else{
                entryPointExist.success=1;
            }
        }else{
            entryPointExist.success=0;
            errors.push(entryPath);
            entryPointExist.errors = errors;
        }
    }
}
var widgetInterface = new Widget();
module.exports = widgetInterface;