"use strict";
let getData ={
    installedDrivers : ()=>{
        let installedDrivers = ["abst_driver","barco_cms_driver","camera_driver","dell_driver","host_manager","message_broadcast","shiv_driver","test_driver"];
        return installedDrivers;
    },
    installedWidgets : ()=>{
        let installedWidgets = [];
        return installedWidgets;
    },
    getFoundationVersion:()=>{
        let foundationVersion = '3.0.0';
        return foundationVersion;
    },
    getLocale:()=>{
        let language = "ar_EG";
        if(language){
            return language;
        }else{
            return "en_US";
        }
    }
}
module.exports = getData;