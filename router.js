"use strict";
const express = require("express");
const http = require("http");
const fs  = require("fs");
const zipUnzipPackage = require("adm-zip");

const widgetEngine = require("./WidgetInterface");
const router = express.Router();


router.post("/download",(req,res)=>{
    let url = req.body.url;
    let tmpFilePath = "tmp/widget.zip";
    let dest  = "installed/widget";
    let errors=[];
    (!url)?errors.push("url is required"):true;

    http.get(url,(response)=>{          
            if(response.headers['content-type'] !='application/zip'){
                res.status(404).json({
                    success:0,
                    msg:"Zip File Not Exist"
                });
            }
            response.on("data",(data)=>{
                let downloadFile  = widgetEngine.downloadFile(tmpFilePath,data);
                if(downloadFile.success==0){
                    res.status(500).json(downloadFile);
                }
            });
            response.on("end",(data)=>{
                //unziping files 
                let extractWidget = widgetEngine.ExtractZipFile(tmpFilePath,dest);
                //deleting tmp files
                let deleteWidget = widgetEngine.deleteFileDirectory(tmpFilePath);
                //renaming file 
                const widgetName = widgetEngine.getWidgetConfiguration("widget");
                let renameWidget = widgetEngine.renameDir(dest,`installed/${widgetName.variable_name}/`);
                if(extractWidget.success == 0){
                    res.status(500).json(extractWidget)
                }
                else if(deleteWidget.success == 0){
                    res.status(500).json(deleteWidget)
                }
                else if(renameWidget.success ==0){
                    res.status(500).json(renameWidget)
                }else{
                    res.status(200).json({
                        success:1,
                        msg:`${widgetName.variable_name} donwloaded successfully`
                    });
                }
            });
    });
    
});

module.exports = router;