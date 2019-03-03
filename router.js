"use strict";
const express = require("express");
const widgetEngine = require("./WidgetInterface");
const router = express.Router();

router.post("/install",(req,res)=>{
    let url = req.body.url;
    let widgetName = req.body.widgetName;
    let errors=[];

    (!url)?errors.push("url is required"):true;
    (!widgetName)?errors.push("widgetName is required"):true;
    if(errors.length !=0){
        res.json({success:0,errors:errors});
    }else{
        let installWidgetEngine = widgetEngine.install(url,widgetName);
        if(installWidgetEngine.success ===1){
            res.json({success:1,msg:"installed Successfully"});
        }else{
            res.json({success:0,msg:"Error Happen !!",errors:errors});  
        }
    }
    
});

module.exports = router;