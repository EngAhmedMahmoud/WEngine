"use strict";
const fs = require("fs");
const fs_extra = require("fs-extra");
const zipUnzipPackage = require("adm-zip");
const WidgetModel = require("./Models/widget_config"); 
const pug = require("pug");
const path = require("path");
const getData = require("./getData");

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
                msg:`${source} Extracting Error!!! To ${dest}`,
                error:error
            }
        }
        
    }
    deleteFile(filePath){
        try{
            fs_extra.removeSync(path.join(__dirname,filePath));
            return {
                success:1
            }
        }catch(error){
            return {
                success:0,
                msg:`${filePath} Deleting Error!!!${error}`,
                error:error
            }
        }
        
    }
    deleteDir(dirPath){
        try{
            fs_extra.removeSync(dirPath);
            return {
                success:1
            }
        }catch(error){
            return {
                success:0,
                msg:`${dirPath} Deleting Error!!!${error}`,
                error:error
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
                msg:`The same widget already exist`,
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
    removingObjectFromArray(array,object){
        if(array.length !=0){
            const index = array.indexOf(object);
            array.splice(index,1);
            return array;
        }
    }
    async checkWidgetVisiability(widgetName){
        let dbWidget = await WidgetModel.findOne({ variableName: widgetName ,visibility:true});
        if(dbWidget){
            return {
                success:1
            };
        }else{
            return {
                success:0,
                msg:"Widget Not Exist"
            };
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
                msg:`${widgetPath} does not exist`
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
                        driverExist.error = drivers;
                        driverExist.msg = "Driver dependancy files not exist"
                    }
                }
                if(driverExist.success === 0){
                    return driverExist;
                }else{
                    return {success:1};
                }
            }else{
                return {
                    success:0,
                    msg:`${driverPath} Not exist`,
                }
            }
        }else{
            return {
                success:0,
                msg:"Check driver dependancy files"
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
                if(dependancyWidgetsCount!=0){
                    for(let i = 0; i<dependancyWidgetsCount;i++){
                        let widget = dependancyWidgets[i].variable_name;
                        let depWidgetPath = `${widgetPath}/${widget}.js`;
                        if(!fs.existsSync(depWidgetPath)){
                            widgetExist.success=0;
                            widgets.push(widget);
                            widgetExist.error = widgets;
                            widgetExist.msg="Widgets not Exist";
                        }
                    }
                    if(widgetExist.success === 0){
                        return widgetExist;
                    }else{
                        return {success:1};
                    }
                }else{
                    return {success:1};
                }  
            }else{
                return {success:0,msg:`${widgetPath} Not Exist`}; 
            }
            
        }else{
            return {
                success:0,
                msg:"Check widget dependancy files"
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
                entryPointExist.msg =`${entryPath}/${entryPoint} Not Exist`;

            }else{
                entryPointExist.success = 1;
            }
        }else{
            entryPointExist.success = 0;
            entryPointExist.msg = `${entryPath} Not Exist`;
        }
        return entryPointExist;
    }
    checkAssets(widgetName){

        const assetsPath  = `installed/${widgetName}/assets`;
        const imagesPath  = `installed/${widgetName}/assets/image`;
        const jsPath      = `installed/${widgetName}/assets/js`;
        const cssPath     = `installed/${widgetName}/assets/css`;
        let errors =[];
        if (!fs.existsSync(assetsPath)) {
            errors.push(`${assetsPath} Not Exist`);
        }
        if (!fs.existsSync(imagesPath)) {
            errors.push(`${imagesPath} Not Exist`);
        }
        if (!fs.existsSync(jsPath)) {
            errors.push(`${jsPath} Not Exist`);
        }
        if (!fs.existsSync(cssPath)) {
            errors.push(`${cssPath} Not Exist`);
        }
        if(errors.length !=0){
            return {
                success:0,
                msg:"Error in widget assets folder",
                error:errors
            }
        }else{
            return {
                success:1
            }
        }
        
    }
    checkLangFiles(widgetName){
        const langs = this.getWidgetConfiguration(widgetName).langs;
        const langsPath = `installed/${widgetName}/langs`;
        if(langs){
            const langKeys = Object.keys(langs);
            let langsExist = {};
            let langs_files = [];
            if (fs.existsSync(langsPath)) {
                langKeys.forEach((key)=>{
                    if(langs[`${key}`] == true){
                        //check file existance
                        let langFilePath = `installed/${widgetName}/langs/${key}.locale.json`;
                        if(!fs.existsSync(langFilePath)){
                            langsExist.success=0;
                            langs_files.push(langFilePath);
                            langsExist.error = langs_files;
                            langsExist.msg = "Languages files not exist"
                        }
                    }
                });
                if(langsExist.success===0){
                    return langsExist;
                }else{
                    return {success:1};
                }
            }else{
                return {
                    success:0,
                    msg:`${langsPath} Not exist`
                }
            }
        }else{
            return {
                success:0,
                error:"No langs in config files"
            }
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
                return {
                    success:0,
                    msg:`${widgetName}  Not saved in database`,
                    error:error.errmsg
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
            let difference = drivers.filter(x => !Drivers.includes(x));
               return{
                   success:0,
                   msg:`please check that ${difference} is installed`
               }
           }
        }else{
            return{
                success:0,
                msg:"No driver dependancies"
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
           if(check){
               return {
                   success:1,
               }
           }else{
            let difference = widgets.filter(x => !Widgets.includes(x));

               return{
                   success:0,
                   msg:`please check that ${difference} is installed`
               }
           }
        }else{
            return{
                success:0,
                msg:`No widget dependancies`
            }
        }
    }
    listDirs(path){
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
    async visibilityControl(widgetName){
        const visibilityVal = await WidgetModel.findOne({variableName:widgetName});
        let visibilityUpdate;
        if(visibilityVal){
            if(visibilityVal.visibility == true){
                visibilityUpdate = await WidgetModel.findOneAndUpdate({variableName:widgetName},{visibility:false},{new:true});
                    return {
                        success:1,
                        data:visibilityUpdate.visibility
                    }
               }else{
                visibilityUpdate = await WidgetModel.findOneAndUpdate({variableName:widgetName},{visibility:true},{new:true});
                    return {
                        success:1,
                        data:visibilityUpdate.visibility
                    }
               }
        }else{
            return {
                success:0
            }
        }
       
    }
    async installedWidgets(path){
        let installed = this.listDirs(path);
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
    widgetStatus(){
      return  WidgetModel.find({k},{_id:1,variableName:1,visibility:1})
        .then((widgets)=>{
            if(widgets.length !=0){
                return {
                    success:1,
                    widgets:widgets,
                    status:200
                }
            }else{
                return {
                    success:0,
                    msg:"No Widgets Installed",
                    status:404
                }
            }
        })
        .catch((error)=>{
            return {
                success:0,
                msg:`Error Happen !! ${error}`,
                status:500
            }
        });
        
    }
    readDirFileContent(path){
        let filecontents = {};
        if (fs.existsSync(path)){
            let contents = fs.readdirSync(path);
                if(contents && contents.length !=0){
                    let filesCount = contents.length;
                    for(let i=0; i< filesCount; i++){
                        let fileName = contents[i].split(".")[0];
                        let content = fs.readFileSync(`${path}/${contents[i]}`, "UTF-8");
                        filecontents[fileName] = JSON.parse(content);
                    }
                    return filecontents; 
                }
        }else{
            return null;
        }
    }
    readFileContent(path){
        if(fs.existsSync(path)){
            var configurations = JSON.parse(fs.readFileSync(path,"UTF-8"));
            return {
                success:1,
                data:configurations
            };
        }else{
            return {
                success:0,
                msg:`${path} not exist`
            }
        }
    }
    getWidgetLang(widgetName){
        let langPath = `installed/${widgetName}/langs`;
        let langs   = {};
        let lang = this.readDirFileContent(langPath);
       
        if(lang != null){
            langs[`${widgetName}`] = lang;  
        }else{
            langs = null ; 
        }
        return langs;
    }
    checkWidgetLang(widgetName,langCode){
        let widgetConfig = this.getWidgetConfiguration(widgetName);
        if(widgetConfig && widgetConfig.langs && widgetConfig.langs[langCode] == true){            
            return langCode;
        }else{
            return "en_US";
        }

    }
    async customPage(widgets){
        const widgetsArray = widgets;
        const language = getData.getLocale();
        if(widgetsArray && widgetsArray.length!=0){
            let widgets = widgetsArray;
            let widgetsCount = widgets.length;
            let processedWidget = [];
            for(let wid =0; wid<widgetsCount;wid++){
                let widgetName =widgets[wid].name;
                //checkVisiability
                let widgetVisiability = await this.checkWidgetVisiability(widgetName);
                //checkInstallation
                let widgetInstalled = this.checkWidgetDirectory(widgetName);
                if(widgetVisiability.success == 1 && widgetInstalled.success == 1){
                    widgets[wid].data = await WidgetModel.findOne({ variableName: widgetName ,visibility:true});
                    if( widgets[wid] && widgets[wid].data &&  widgets[wid].data.entry_point){
                        let entryPointPath = path.join(__dirname,"/installed/",widgetName,"/views/", widgets[wid].data.entry_point)
                        if(fs.existsSync(entryPointPath)){
                                //check widget language
                                let locale = this.checkWidgetLang(widgetName,language);
                                if(this.getWidgetLang(widgetName)!=null){
                                    widgets[wid].locale = this.getWidgetLang(widgetName)[widgetName][locale];
                                }else{
                                    widgets[wid].locale='';
                                }
                                widgets[wid][widgetName] = await pug.renderFile(entryPointPath,{
                                locale:widgets[wid].locale
                            });
                            //get css files and js files
                            let cssFiles   = this.listDirs(`installed/${widgetName}/assets/css`);
                            let jsFiles    = this.listDirs(`installed/${widgetName}/assets/js`);
                            let imageFiles = this.listDirs(`installed/${widgetName}/assets/image`);
    
                            if(cssFiles.success == 1 && cssFiles.folders.length !=0){
                                widgets[wid].styles = cssFiles.folders;
                            }
                            if(jsFiles.success == 1 && jsFiles.folders.length != 0){
                                widgets[wid].js = jsFiles.folders;
                            }
                            if(imageFiles.success == 1 && imageFiles.folders.length != 0){
                                widgets[wid].image = imageFiles.folders;
                            }
                        }
                    }
                    processedWidget.push(widgets[wid]);
                    
                }
            }
            return {
                success:1,
                widgets:processedWidget
            }
        }else{
            return{
                success:0,
                msg:"Sorry No widgets available"
            }
        }
    }
    versionComapre(oldVersion,newVersion){
        //version comparing
        let splittedOldVersion      = oldVersion.split(".");
        let splittednewVersion      = newVersion.split(".");
        let oldVersionMajor         = splittedOldVersion[0];
        let newVersionMajor         = splittednewVersion[0];

        let oldVersionMainor        = splittedOldVersion[1];
        let newVersionMainor        = splittednewVersion[1];

        let oldVersionPatch         = splittedOldVersion[2];
        let newVersionPatch         = splittednewVersion[2];
        let upgrade = "downgrade";
        if(oldVersionMajor < newVersionMajor){
            upgrade = "upgrade";
        }
        //check equlaity
        if(oldVersionMajor == newVersionMajor){
            //check minor
            if(oldVersionMainor < newVersionMainor){
                upgrade = "upgrade";
            }
            //check equilty
            if(oldVersionMainor == newVersionMainor){
                //check patch
                if(oldVersionPatch < newVersionPatch){
                    upgrade = "upgrade";
                }
                if(oldVersionPatch == newVersionPatch){
                    upgrade = "equal";
                }
            }
        }
        return upgrade;
    }
    async deleteDBWidget(widgetName){
        await  WidgetModel.deleteOne({variableName:widgetName});
    }
    widgetFoundationVersion(widgetName){
        let configPath = `installed/${widgetName}/config.json`;
        let widgetConfig = this.readFileContent(configPath);
        if(widgetConfig.success==1){
            let widgetMinFoundationVersion = widgetConfig.data.min_foundation;
            let foundationVersion = getData.getFoundationVersion();
            //comparing version
            let versionCompare = this.versionComapre(widgetMinFoundationVersion,foundationVersion);
            if(versionCompare == "equal" || versionCompare == "upgrade"){
                return {
                    success:1
                }
            }else{
                return {
                    success:0,
                    msg:`Widget Min-foundation version ${widgetMinFoundationVersion} not compatible with foundation Version ${foundationVersion} Please Upgrade Foundation`
                }
            }
        }else{
            return widgetConfig;
        }
        
    }
    backUp(widgetName){
        let zip = new zipUnzipPackage();
        let dirPath = `installed/${widgetName}`;
        //check widgetDir
        let check = this.checkWidgetDirectory(widgetName);
        if(check.success == 1){
            //compressing files
            try{
                zip.addLocalFolder(dirPath);
                zip.toBuffer();
                zip.writeZip(path.join(__dirname,`backup/${widgetName}_${Date()}.zip`));
                return{
                    success:1
                }
            }catch(error){
                return{
                    success:0,
                    msg:"Error When backup data",
                    error:error
                }
            }
        }else{
             return {
                 success:0,
                 msg:`${widgetName} does not exist`
             }
        }
    }
}
class Installation extends Widget{
    async install(widgetName){
        //check files and dirs
        let checkWidgetDirectory  = this.checkWidgetDirectory(widgetName);
        let checkDriverDependancy = this.checkDriverDependancy(widgetName);
        let checkWidgetDependancy = this.checkWidgetDependancy(widgetName);
        let checkEntryPoint       = this.checkEntryPoint(widgetName);
        let checkAssets           = this.checkAssets(widgetName);
        let checkLangsFiles       = this.checkLangFiles(widgetName);
        //
        //check dependancies
        let depDrivers = getData.installedDrivers();
        let depWidgets = getData.installedWidgets();
        let driverDep = this.listAndCheckDependantDrivers(depDrivers,widgetName);
        let widgetDep = this.listAndCheckDependantWidgets(depWidgets,widgetName);
        //
        //check version foundation with widget
        let widgetVersion = this.widgetFoundationVersion(widgetName);
        //
        if(checkWidgetDirectory.success==0){
            return checkWidgetDirectory;
        }else if(checkDriverDependancy.success==0){
            return checkDriverDependancy;
        }else if(checkWidgetDependancy.success == 0){
            return checkWidgetDependancy;
        }else if(checkEntryPoint.success==0){
            return checkEntryPoint;
        }else if(checkAssets.success==0){
            return checkAssets;
        }else if(checkLangsFiles.success == 0){
            return checkLangsFiles;
        }else if(driverDep.success == 0){
            return driverDep;
        }else if(widgetDep.success == 0){
            return widgetDep;
        }else if(widgetVersion.success ==0){
            return widgetVersion;
        }else{
            //get widget configuration
            let widgetSave =   await this.saveWidget(widgetName);
            if(widgetSave.success == 0){
                return widgetSave;
            }else{
                return {
                    success:1,
                    msg:"widget saved and installed successfully"
                }
            }
        }
    }
    async uninstall(widgetName,installedWidgetPath){
        this.deleteDir(installedWidgetPath);
        await this.deleteDBWidget(widgetName);
    }
    async deleteWidget(widgetName){
        let installedWidgetPath = `installed/${widgetName}`;
        //backup widget first
        let backup = this.backUp(widgetName);
        if(backup.success == 0){
            return backup;
        }else{
            await this.uninstall(widgetName,installedWidgetPath);
            return {
                success:1,
                msg:`${widgetName} deleted successfully`
            }
        }
    }
    async upgrade(widgetName){
        //Read configuration for both widgets
        let oldConfigPath  = `installed/${widgetName}/config.json`;
        let newConfigPath  = `installed/${widgetName}_upgrade/config.json`;
        let oldConfig      = this.readFileContent(oldConfigPath);
        let newConfig      = this.readFileContent(newConfigPath);
        let errors         = [];
        const oldWidgetPath = `installed/${widgetName}_upgrade/`;
        const newUpgradedWidget = `installed/${widgetName}/`;

        if(oldConfig.success != 1){
            errors.push(`installed/${widgetName}/config.json Not Exist`);
        }
        if(newConfig.success != 1){
            errors.push(`installed/${widgetName}_upgrade/config.json Not Exist`);
        }
        if(errors.length != 0){
            this.deleteDir(oldWidgetPath);
            return {
                success:0,
                error:errors
            }
        }else{
            //comparing two versions
            let versionComparison = this.versionComapre(oldConfig.data.version,newConfig.data.version);
            if(versionComparison == "upgrade"){
                //delete old widget
                let widgetDelete = await this.deleteWidget(widgetName);
                if(widgetDelete.success==0){
                    return widgetDelete;
                }else{
                    //rename
                    let renameWidget = this.renameDir(oldWidgetPath,newUpgradedWidget);
                    if(renameWidget.success==0){
                        return renameWidget
                    }else{
                        //install
                        let install = await this.install(widgetName);
                        return install;
                    }
                    
                }   
            }else if(versionComparison == "equal"){
                //no upgrade
                //delete upgraded folder
                let widgetDelete =  this.deleteDir(oldWidgetPath);
                if(widgetDelete.success==0){
                    return widgetDelete;
                }else{
                    return {
                        success:0,
                        msg: "two widget versions are equal"
                    }
                }

            }else{
                //no upgrade
                //delete upgraded folder
                let widgetDelete =  this.deleteDir(oldWidgetPath);
                if(widgetDelete.success==0){
                    return widgetDelete;
                }else{
                    return {
                        success:0,
                        msg: "New widget version are less than old widget"
                    }
            }
        }
        
    }
    }
}
var widgetInterface = new Installation();
module.exports = widgetInterface;