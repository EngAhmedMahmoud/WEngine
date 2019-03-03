"use strict";
const fs = require("fs");
const http = require("http");
const zipUnzipPackage = require("adm-zip");
const WidgetModel = require("./Models/widget_config"); 

class Widget{
    getWidget(url,widgetName){
        try{
            var tmpFilePath = "tmp/" + widgetName + ".zip";
            http.get(url,(response)=>{
                response.on("data",(data)=>{
                    fs.appendFileSync(tmpFilePath,data);
                });
                response.on("end",(data)=>{
                    var widgetZipFile = new zipUnzipPackage(tmpFilePath);
                    widgetZipFile.extractAllTo("installed/"+widgetName);
                    fs.unlinkSync(tmpFilePath);
                });
                response.on("error",(error)=>{
                    return {
                        success:0,
                        errors:error
                    }
                });
            });
            
        }catch(error){
            if(error){
                return {
                    success:0,
                    errors:error
                }
            }
        }
    }
    validateWidgetHierarcy(widgetName){
        let widgetDep       = this.checkWidgetDependancy(widgetName);
        let driverDep       = this.checkDriverDependancy(widgetName);
        let checkJsFiles    = this.checkJsFiles(widgetName);
        let checkCssFiles   = this.checkCssFiles(widgetName);
        let checkEntryPoint = this.checkEntryPoint(widgetName);
        let errors          = [];
        (widgetDep.success && widgetDep.success != 1) ? errors.push(widgetDep.msg):{success:1};
        (driverDep.success && driverDep.success != 1) ? errors.push(driverDep.msg):{success:1};
        (checkCssFiles.success && checkCssFiles.success != 1) ? errors.push(checkCssFiles.msg):{success:1};
        (checkEntryPoint.success && checkEntryPoint.success != 1) ? errors.push(checkEntryPoint.msg):{success:1};
        (checkJsFiles.success != 1) ? errors.push(checkJsFiles.msg):{success:1};

        if(errors.length === 0){
            return {
                success:1
            }
        }else{
            return {
                success:0,
                errors:errors
            }
        }
    }
    getWidgetConfiguration(widgetName){
        var configFile = `installed/${widgetName}/config.json`;
        if(fs.existsSync(configFile)){
            var configurations = JSON.parse(fs.readFileSync(configFile,"UTF-8"));
            return configurations;
        }else{
            return {
                success:0,
                msg:"configuration file not exist"
            }
        }
       
    }
    checkDriverDependancy(widgetName){
        const dependancyDrivers = this.getWidgetConfiguration(widgetName).dep_drivers;
        const driverPath = `installed/${widgetName}/driver_dep`;

        if(dependancyDrivers){
            const dependancyDriversCount = dependancyDrivers.length;
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
            }else{
                return {
                    success:0,
                    msg:`${driverPath} Not exist`
                }
            }
        }else{
            return {
                success:0,
                msg:"No driver dependancies"
            }
        }
    }
    checkWidgetDependancy(widgetName){
        const dependancyWidgets = this.getWidgetConfiguration(widgetName).dep_widgets;
        const widgetPath = `installed/${widgetName}/widget_dep`;
        if(dependancyWidgets){
            const dependancyWidgetsCount = dependancyWidgets.length;
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
        }else{
            return {
                success:0,
                msg:"No widget dependancies"
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
                        cssExist.msg=`css files Not Exist`;
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
                msg:`${cssPath} Not Exist`
            }
        }

    }
    checkJsFiles(widgetName){
        const jsScripts    = this.getWidgetConfiguration(widgetName).scripts;
        const jsPath       = `installed/${widgetName}/assets/js`;
        if(jsScripts){
            const jsFilesCount = jsScripts.length;
            let jsExist = {};
            let js = [];
            if (fs.existsSync(jsPath)) {
                for(let i = 0; i<jsFilesCount;i++){
                    let jsFile = jsScripts[i];
                    let jsFilePath = `${jsPath}/${jsFile}`;
                    if(!fs.existsSync(jsFilePath)){
                        jsExist.success=0;
                        js.push(jsFile);
                        jsExist.errors = js;
                        jsExist.msg="JS files Not Exist";
                    }
                }
                if(jsExist.success===0){
                    return jsExist;
                }else{
                    return {success:1};
                }
            }else{
                return {
                    success:0,
                    errors:jsPath,
                    msg:`${jsPath} Not Exist`
                }
            }
        }else{
            return {success:1};  
        }
    }
    saveWidget(widgetName){
        const widgetContent = this.getWidgetConfiguration(widgetName);
        var widget = new WidgetModel();
        
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
    listDependantDrivers(Drivers,widgetName){
        const dependancyDrivers = this.getWidgetConfiguration(widgetName).dep_drivers;
        if(dependancyDrivers){
            let drivers =[];
            const driverCount = dependancyDrivers.length;
            for(let i=0; i < driverCount;i++){
                drivers.push(dependancyDrivers[i].variable_name);
            }
            //check drivers 
           const check = (Drivers.sort().toString() == drivers.sort().toString())?true:false;
           if(check){
               return {
                   success:1,
               }
           }else{
               return{
                   success:0
               }
           }
        }
       
    }
}
class Installation extends Widget{
    install(url,widgetName){
        let getWidget = this.getWidget(url,widgetName);
        // let checkHierarcy =this.validateWidgetHierarcy(widgetName);
        // let errors =[];
        // if(getWidget.success !=1){
        //     errors.push(getWidget.errors);
        // }
        // if(checkHierarcy.success !=1){
        //     errors.push(checkHierarcy.errors);
        // }
        // if(errors.length ==0){
        //     return {
        //         success:1
        //     }
        // }else{
        //     return {
        //         success:0,
        //         errors:errors
        //     }
        // }
    }
}
var widgetInterface = new Installation();
module.exports = widgetInterface;

