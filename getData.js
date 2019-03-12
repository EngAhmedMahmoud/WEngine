"use strict";
let getData ={
    installedDrivers : ()=>{
        let installedDrivers = ["abst_driver","barco_cms_driver","camera_driver","dell_driver","host_manager","message_broadcast","shiv_driver","test_driver","testvar"];
        return installedDrivers;
    },
    installedWidgets : ()=>{
        let installedWidgets = ["btWidget","camera_view","layout_widget"];
        return installedWidgets;
    },
    getFoundationVersion:()=>{
        let foundationVersion = '3.0.0';
        return foundationVersion;
    }


}
module.exports = getData;