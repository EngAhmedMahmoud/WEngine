"use strict";
const fs = require("fs");
const http = require("http");
const zipUnzipPackage = require("adm-zip");
const WidgetModel = require("./Models/widget_config"); 

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
    validateWidgetHierarcy(widgetName){
        //check driver dependancy 
        //check widget dependancy 
        //check entry point
        //check static files
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
        let errors = [];
        if (fs.existsSync(entryPath)){
            let entryPintPath = `${entryPath}/${entryPoint}`;
            if(!fs.existsSync(entryPintPath)){
                entryPointExist.success = 0;
                errors.push(entryPoint);
                entryPointExist.errors = errors;
            }else{
                entryPointExist.success = 1;
            }
        }else{
            entryPointExist.success = 0;
            errors.push(entryPath);
            entryPointExist.errors = errors;
        }
        return entryPointExist;
    }
    checkCssFiles(widgetName){
        const styles        = this.getWidgetConfiguration(widgetName).styles;
        const cssPath       = `installed/${widgetName}/assets/css`;
        
        if(styles){
            const cssFilesCount = styles.length;
            let cssExist = {};
            let css = [];
            if (fs.existsSync(cssPath)) {
                for(let i = 0; i<cssFilesCount;i++){
                    let cssFile = styles[i];
                    let cssFilePath = `${cssPath}/${cssFile}`;
                    if(!fs.existsSync(cssFilePath)){
                        cssExist.success=0;
                        css.push(cssFile);
                        cssExist.errors = css;
                        cssExist.msg="Not Exist";
                    }
                }
                if(cssExist.success===0){
                    return cssExist;
                }else{
                    return {success:1};
                }
            }
        }else{
            return {
                success:0,
                errors:cssPath,
                msg:"Not Exist"
            }
        }

    }
    checkJsFiles(widgetName){
        const jsScripts    = this.getWidgetConfiguration(widgetName).scripts;
        const jsPath       = `installed/${widgetName}/assets/js`;
        if(jsScripts){
            const jsFilesCount = jsScripts.length;
            let jsExist = {};
            let css = [];
            if (fs.existsSync(cssPath)) {
                for(let i = 0; i<jsFilesCount;i++){
                    let jsFile = jsScripts[i];
                    let jsFilePath = `${cssPath}/${jsFile}`;
                    if(!fs.existsSync(jsFilePath)){
                        jsExist.success=0;
                        css.push(jsFile);
                        jsExist.errors = css;
                        jsExist.msg="Not Exist";
                    }
                }
                if(jsExist.success===0){
                    return jsExist;
                }else{
                    return {success:1};
                }
            }
        }else{
            return {
                success:0,
                errors:jsPath,
                msg:"Not Exist"
            }
        }
    }
    saveWidget(widgetName){
        const widgetContent = this.getWidgetConfiguration(widgetName);
        var widget = new Widget();
        var dep_drivers = [];
        var dep_widgets = [];
        var dep_parsed = widgetContent.dep_drivers;
        dep_parsed.forEach(driver => {
        let dep = {};
        dep.variable_name = driver.variable_name;
        dep.version = driver.version;
        dep_drivers.push(dep);
        });
        var dep_parsed_w = widgetContent.dep_widgets;
        dep_parsed_w.forEach(widget => {
        let dep = {};
        dep.variable_name = widget.variable_name;
        dep.version = widget.version;
        dep_widgets.push(dep);
        });
        widget.name = (widgetContent.name) ? widgetContent.name : "";
        widget.variableName = (widgetContent.variable_name) ? widgetContent.variable_name : "";
        widget.description = (widgetContent.desc) ? widgetContent.desc : "";
        widget.version = (widgetContent.version) ? widgetContent.version : "";
        widget.minFoundationVersion = (widgetContent.min_foundation) ? widgetContent.min_foundation : "";
        widget.entry_point = (widgetContent.entry_point) ? widgetContent.entry_point : "";
        widget.location.x = (widgetContent.location && widgetContent.location.x) ? widgetContent.location.x : "";
        widget.location.y = (widgetContent.location && widgetContent.location.y) ? widgetContent.location.y : "";
        widget.size.min.width = (widgetContent.size && widgetContent.size.min && widgetContent.size.min.width) ? widgetContent.size.min.width : "";
        widget.size.min.height = (widgetContent.size && widgetContent.size.min && widgetContent.size.min.height) ? widgetContent.size.min.height : "";
        widget.size.max.width = (widgetContent.size && widgetContent.size.max && widgetContent.size.max.width) ? widgetContent.size.max.width : "";
        widget.size.max.height = (widgetContent.size && widgetContent.size.max && widgetContent.size.max.height) ? widgetContent.size.max.height : "";
        widget.langs.en_US = (widgetContent.langs && widgetContent.langs.en_US) ? widgetContent.langs.en_US : false;
        widget.langs.ar_EG = (widgetContent.langs && widgetContent.langs.ar_EG) ? widgetContent.langs.ar_EG : false;
        widget.langs.es_ES = (widgetContent.langs && widgetContent.langs.es_ES) ? widgetContent.langs.es_ES : false;
        widget.langs.de_DE = (widgetContent.langs && widgetContent.langs.de_DE) ? widgetContent.langs.de_DE : false;
        widget.langs.fr_FR = (widgetContent.langs && widgetContent.langs.fr_FR) ? widgetContent.langs.fr_FR : false;
        widget.dep_drivers = (dep_drivers) ? dep_drivers : [];
        widget.dep_widgets = (dep_widgets) ? dep_widgets : [];
        widget.styles = (widgetContent.styles) ? widgetContent.styles : [];
        widget.scripts = (widgetContent.scripts) ? widgetContent.scripts : [];
        widget.save();
    }
    

}
var widgetInterface = new Widget();
module.exports = widgetInterface;

