"use strict";
const express = require("express");
const http = require("http");
const widgetEngine = require("./WidgetInterface");
const router = express.Router();
const path = require("path");

router.post("/install",(req,res)=>{
    let url = req.body.url;
    let tmpFilePath = "tmp/widget.zip";
    let dest  = "installed/widget";
    let errors=[];
    (!url)?errors.push("url is required"):url;
    if(errors.length !=0){
        res.status(500).json({
            success:0,
            errors:errors
        })
    }else{
        http.get(url,(response)=>{          
            if(response.headers['content-type'] !='application/zip'){
                res.status(404).json({
                    success:0,
                    msg:"Zip File Not Exist"
                });
            }else{
                response.on("data",async(data)=>{
                    let downloadFile  = widgetEngine.downloadFile(tmpFilePath,data);
                    //unziping files 
                    let extractWidget = widgetEngine.ExtractZipFile(tmpFilePath,dest);
                    //deleting tmp files
                    let deleteWidget = widgetEngine.deleteFile(tmpFilePath);
                    //renaming file 
                    const widgetConfig = widgetEngine.getWidgetConfiguration("widget");
                    const widgetName = widgetConfig.variable_name;
                    const installedWidgetPath = `installed/${widgetName}/`;
                    let renameWidget = widgetEngine.renameDir(dest,installedWidgetPath);
                    if(downloadFile.success==0){
                        widgetEngine.deleteDir(installedWidgetPath);
                        res.status(500).json(downloadFile);
                    }else if(extractWidget.success == 0){
                        widgetEngine.deleteDir(installedWidgetPath);
                        res.status(500).json(extractWidget)
                    }
                    else if(deleteWidget.success == 0){
                        widgetEngine.deleteDir(installedWidgetPath);
                        res.status(500).json(deleteWidget)
                    }
                    else if(renameWidget.success == 0){
                            widgetEngine.deleteDir(dest);
                            res.status(500).json(renameWidget)
                    }else{
                        //installing and saving widget
                        let install = await widgetEngine.install(widgetName);
                        if(install.success == 0){
                            await widgetEngine.uninstall(widgetName,installedWidgetPath);
                            res.status(404).json(install);

                        }else{
                            //serving installed widget static files during run time
                            router.use(`/${widgetName}`,express.static(path.join(__dirname,'installed',widgetName,'assets')));
                            res.status(200).json({
                                success:1,
                                msg:`${widgetName} donwloaded and installed successfully`
                            }); 

                        } 
                        }
                });
            }
    });
    }
    
});
router.post("/delete",async(req,res)=>{
    let widgetName = req.body.widgetName;
    let errors =[];
    if(!widgetName){
        errors.push("widgetName is required !!!");
    }
    if(errors && errors.length != 0 ){
        res.status(500).json({
            success:0,
            errors:errors
        });
    }else{
        let widgetDelete = await widgetEngine.deleteWidget(widgetName);
        if(widgetDelete.success==1){
            res.status(200).json(widgetDelete);
        }else{
            res.status(500).json(widgetDelete);
        }
    }
})
router.post("/depDrivers",(req,res)=>{
    let drivers    = req.body.drivers.split(",");
    let widgetName = req.body.widgetName;
    let errors =[];
    if(!drivers){
        errors.push("drivers are required!!!");
    }
    if(!widgetName){
        errors.push("WidgetName is required !!!");
    }
    if(errors&&errors.length != 0 ){
        res.status(500).json({
            success:0,
            errors:errors
        });
    }else{
        
        let dependantDrivers = widgetEngine.listAndCheckDependantDrivers(drivers,widgetName);
        if( dependantDrivers.success == 0 ){
            res.status(500).json(dependantDrivers);
        }else{
            res.status(200).json(dependantDrivers);
        }
    }
    
    
});
router.post("/depWidgets",(req,res)=>{
    let widgets    = req.body.widgets.split(",");
    let widgetName = req.body.widgetName;
    let errors =[];
    if(!widgets){
        errors.push("widgets are required!!!");
    }
    if(!widgetName){
        errors.push("WidgetName is required !!!");
    }
    if(errors&&errors.length != 0 ){
        res.status(500).json({
            success:0,
            errors:errors
        });
    }else{
        
        let dependantWidgets = widgetEngine.listAndCheckDependantWidgets(widgets,widgetName);
        if( dependantWidgets.success == 0 ){
            res.status(500).json(dependantWidgets);
        }else{
            res.status(200).json(dependantWidgets);
        }
    }
    
    
});
router.get("/installedWidgets",async(req,res)=>{
    let path = 'installed'
    let widgets = await widgetEngine.installedWidgets(path);
    if(widgets.success==0){
        res.status(404).json(widgets);
    }else{
        res.status(200).json(widgets);
    }
});
router.post("/widgetVisiability",async(req,res)=>{
    let widgetName = req.body.widgetName;
    let errors =[];
    if(!widgetName){
        errors.push("widgetName is required !!!");
    }
    if(errors && errors.length != 0 ){
        res.status(500).json({
            success:0,
            errors:errors
        });
    }else{
        widgetEngine.visibilityControl(widgetName)
            .then((data)=>{
                if(data.success ==1){
                    res.status(200).json({
                        success:1,
                        msg:"updated Successfully",
                        data:data.data
                    });
                }else{
                    res.status(404).json({
                        success:0,
                        msg:"This widgetName not exist",
                    }); 
                }
                
            })
            .catch((error)=>{
                res.status(500).json({
                    success:0,
                    msg:"widget not updated",
                    errors:error
                });
            });
    }
    
});
router.post("/widgetLangs",(req,res)=>{
    let widgetName = req.body.widgetName;
    let errors =[];
    if(!widgetName){
        errors.push("widgetName is required !!!");
    }
    if(errors && errors.length != 0 ){
        res.status(500).json({
            success:0,
            errors:errors
        });
    }else{
        let langs = widgetEngine.getWidgetLang(widgetName);
        if(langs){
            res.status(200).json({
                success:1,
                data:langs
            });
        }else{
            res.status(404).json({
                success:0,
                msg:"No data Please Confirm that widgetName exist and installed ",
            }); 
        }
    }
});
router.post("/custom",async(req,res)=>{
    let widgets = req.body.widgets;
    widgets=JSON.parse(widgets);
    let errors=[];
    if(widgets){
        if(widgets.length==0){
            errors.push("Widgets are required");
        }
    }else{
        errors.push("Widgets are required");
    }
    if(errors.length !=0){
        res.status(500).json({
            success:0,
            errors:errors
        });
    }else{
       
        let customPage = await widgetEngine.customPage(widgets);
        if( customPage.success == 1 ){
            let widgets = customPage.widgets;
            res.render('custom', {
                widgets: widgets,
            });
        }else{
            res.redirect("/");
        }  
    }
       
});
router.get("/test",(req,res)=>{
   res.render("test")    
});
router.post("/upgrade",(req,res)=>{
    let url = req.body.url;
    let tmpFilePath = "tmp/widget.zip";
    let dest  = "installed/widget";
    let errors=[];
    (!url)?errors.push("url is required"):url;
    if(errors.length !=0){
        res.status(500).json({
            success:0,
            errors:errors
        });
    }else{
        http.get(url,(response)=>{          
            if(response.headers['content-type'] !='application/zip'){
                res.status(404).json({
                    success:0,
                    msg:"Zip File Not Exist"
                });
            }else{
                response.on("data",async (data)=>{
                    let downloadFile  = widgetEngine.downloadFile(tmpFilePath,data);
                    //unziping files 
                    let extractWidget = widgetEngine.ExtractZipFile(tmpFilePath,dest);
                    //deleting tmp files
                    let deleteWidget = widgetEngine.deleteDir(tmpFilePath);
                    //renaming file 
                    const widgetConfig = widgetEngine.getWidgetConfiguration("widget");
                    const widgetName = widgetConfig.variable_name;
                    const installedWidgetPath = `installed/${widgetName}_upgrade/`;
                    let renameWidget = widgetEngine.renameDir(dest,installedWidgetPath);

                    if(downloadFile.success == 0){
                        widgetEngine.deleteDir(installedWidgetPath);
                        res.status(500).json(downloadFile);
                    }else if(extractWidget.success == 0){
                        widgetEngine.deleteDir(installedWidgetPath);
                        res.status(500).json(extractWidget)
                    }else if(deleteWidget.success == 0){
                        widgetEngine.deleteDir(installedWidgetPath);
                        res.status(500).json(deleteWidget)
                    }
                    else if(renameWidget.success == 0){
                        widgetEngine.deleteDir(dest);
                        res.status(500).json(renameWidget)
                    }else{
                        //here installing the new widget
                        let upgrade = await widgetEngine.upgrade(widgetName);
                        if(upgrade.success==0){
                            res.status(404).json(upgrade); 
                        }else{
                            res.status(200).json(upgrade); 
                        }
                    }
                });
            }
    });
    }
});
router.get("/backup",(req,res)=>{
    //list backup dir
    let path   ='backup'; 
    let backup = widgetEngine.listDirs(path);
    if(backup.success ==1){
        backup.url = `${req.headers.host}/backup/folder_name`;
        res.status(200).json(backup);
    }else{
        res.status(500).json({
            success:0,
            msg:"No backup files"
        });
    }
});
router.get("/management",async(req,res)=>{
    let widgets = await widgetEngine.widgetStatus();
});
router.get("/widgets_status",async(req,res)=>{
    widgetEngine.widgetStatus()
    .then((data)=>{
        res.status(data.status).json(data);
    })
    .catch((error)=>{
        res.status(error.status).json(error);
    });
});
module.exports = router;