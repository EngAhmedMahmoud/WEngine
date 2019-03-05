"use strict";
const express = require("express");
const http = require("http");
const widgetEngine = require("./WidgetInterface");
const router = express.Router();

router.post("/download",(req,res)=>{
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
                response.on("data",(data)=>{
                    let downloadFile  = widgetEngine.downloadFile(tmpFilePath,data);
                    //unziping files 
                    let extractWidget = widgetEngine.ExtractZipFile(tmpFilePath,dest);
                    //deleting tmp files
                    let deleteWidget = widgetEngine.deleteFileDirectory(tmpFilePath);
                    //renaming file 
                    const widgetConfig = widgetEngine.getWidgetConfiguration("widget");
                    const widgetName = widgetConfig.variable_name;
                    const installedWidgetPath = `installed/${widgetName}/`;
                    let renameWidget = widgetEngine.renameDir(dest,installedWidgetPath);
                    if(downloadFile.success==0){
                        res.status(500).json(downloadFile);
                    }else if(extractWidget.success == 0){
                        res.status(500).json(extractWidget)
                    }
                    else if(deleteWidget.success == 0){
                        //deleting new widget
                        res.status(500).json(deleteWidget)
                    }
                    else if(renameWidget.success ==0){
                            widgetEngine.deleteFileDirectory(dest);
                            res.status(500).json(renameWidget)
                    }else{
                            res.status(200).json({
                                success:1,
                                msg:`${widgetName} donwloaded successfully`
                            });
                        }
                });
            }
    });
    }
    
});
router.post("/install",async(req,res)=>{
    let widgetName = req.body.widgetName;
    let errors=[];
    (!widgetName)?errors.push("widgetName is required!!!"):widgetName;
    if(errors.length !=0){
        res.status(500).json({
            success:0,
            errors:errors
        });
    }else{
        let install = await widgetEngine.install(widgetName);
        console.log(install)
        if(install.success==0){
            res.status(404).json(install); 
        }else{
            res.status(200).json(install); 
        }
    }
    
});
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


module.exports = router;