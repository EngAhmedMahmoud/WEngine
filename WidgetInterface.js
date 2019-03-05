"use strict";
const fs = require("fs");
const http = require("http");
const zipUnzipPackage = require("adm-zip");
const WidgetModel = require("./Models/widget_config"); 

class Widget{
    ExtractZipFile(source,dest){
        try{
            var widgetZipFile = new zipUnzipPackage(source);
            widgetZipFile.extractAllTo(dest);
            return {
                success:1
            }
        }catch(error){
            return {
                success:0,
                msg:`${source} Extracting Error!!! To ${dest}`
            }
        }
        
    }
    deleteFileDirectory(source){
        try{
            fs.unlinkSync(source);
            return {
                success:1
            }
        }catch(error){
            return {
                success:0,
                msg:`${source} Deleting Error!!!`

            }
        }
        
    }
    renameDir(oldName,newName){
        try{
            fs.renameSync(oldName, newName);
            return {
                success:1
            }
        }catch(error){
            return {
                success:0,
                msg:`${oldName}  To ${newName} Rename Error!!! Tow directories have same variable_name`,
                error:error
            }
        }
    }
    downloadFile(tmpFilePath,data){
        try{
            fs.appendFileSync(tmpFilePath,data);
            return {
                success:1
            }
        }catch(error){
            return {
                success:0,
                msg:"Downloading error!!",
                error:error
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
    checkWidgetDirectory(widgetName){
        const widgetPath = `installed/${widgetName}`;
        if (fs.existsSync(widgetPath)) {
            return {
                success:1
            }
        }else{
            return {
                success:0,
                errors:`${widgetPath} does not exist`
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
                        driverExist.msg = "Driver dependancy files not exist"
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
                    errors:`${driverPath} Not exist`
                }
            }
        }else{
            return {
                success:0,
                errors:"No driver dependancies"
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
            if (fs.existsSync(widgetPath) && dependancyWidgetsCount!=0) {
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
            if(dependancyWidgetsCount ==0){
                return {
                    success:1
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
        if (fs.existsSync(entryPath)){
            let entryPintPath = `${entryPath}/${entryPoint}`;
            if(!fs.existsSync(entryPintPath)){
                entryPointExist.success = 0;
                entryPointExist.errors =`${entryPath}/${entryPoint} Not Exist`;

            }else{
                entryPointExist.success = 1;
            }
        }else{
            entryPointExist.success = 0;
            entryPointExist.errors = `${entryPath} Not Exist`;
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
            }else{
                return{
                    success:0,
                    errors:cssPath,
                    msg:`${cssPath} Not Exist`
                }
            }
        }else{
            return {
                success:1,
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
        return  widget.save().then((success)=>{
                return {
                    success:1,
                    msg:`${widgetName} saved successfully in database`
                }
                
            }).catch((error)=>{
                return {success:0,
                    msg:`${widgetName}  Not saved in database`,
                    errors:error.errmsg
                };
            });
        
}
    listAndCheckDependantDrivers(Drivers,widgetName){
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
        }else{
            return{
                success:0
            }
        }
       
    }
    listAndCheckDependantWidgets(Widgets,widgetName){
        const dependancyWidgets = this.getWidgetConfiguration(widgetName).dep_widgets;
        if(dependancyWidgets){
            let widgets =[];
            const widgetCount = dependancyWidgets.length;
            for(let i=0; i < widgetCount;i++){
                widgets.push(dependancyWidgets[i].variable_name);
            }
            //check drivers 
           const check = (Widgets.sort().toString() == widgets.sort().toString())?true:false;
           console.log(check);
           if(check){
               return {
                   success:1,
               }
           }else{
               return{
                   success:0
               }
           }
        }else{
            return{
                success:0
            }
        }
    }
    listFiles(path){
        //check path existance 
        if (fs.existsSync(path)){
            let folders = fs.readdirSync(path);
            return{
                success:1,
                folders:folders
            } 
        }else{
            return{
                success:0
            }
        }
       
    }
}
class Installation extends Widget{
    async install(widgetName){
        let checkWidgetDirectory  = this.checkWidgetDirectory(widgetName);
        let checkDriverDependancy = this.checkDriverDependancy(widgetName);
        let checkWidgetDependancy = this.checkWidgetDependancy(widgetName);
        let checkEntryPoint       = this.checkEntryPoint(widgetName);
        let checkCssFiles         = this.checkCssFiles(widgetName);
        let checkJsFiles          = this.checkJsFiles(widgetName);
        if(checkWidgetDirectory.success==0){
            return checkWidgetDirectory;
        }else if(checkDriverDependancy.success==0){
            return checkDriverDependancy;
        }else if(checkWidgetDependancy.success==0){
            return checkDriverDependancy;
        }else if(checkEntryPoint.success==0){
            return checkEntryPoint;
        }else if(checkCssFiles.success==0){
            return checkCssFiles;
        }else if(checkJsFiles.success==0){
            return checkJsFiles;
        }else{
            //get widget configuration
            let widgetSave =   await this.saveWidget(widgetName);
            if(widgetSave.success==0){
                return widgetSave;
            }else{
                return {
                    success:1,
                    msg:"widget saved and installed successfully"
                }
            }
        }
    }
    async installedWidgets(path){
       let installed = this.listFiles(path);
       if(installed.success==0){
           return installed;
       }else{
            let widgets = await WidgetModel.find();
            let folders = installed.folders;
            let widgetsCount = widgets.length;
            let result = [];
            for(let i = 0; i < widgetsCount;i++){
                let widgetName = widgets[i].variableName;
                if(folders.includes(widgetName)){
                    result.push(widgetName);
                }
            }
            if(result.length !=0){
                return {
                    success:1,
                    installedWidgets:result
                }
            }else{
                return {
                    success:0,
                    installedWidgets:result
                }
            }
       }
       
       
    }
}
var widgetInterface = new Installation();
module.exports = widgetInterface;

