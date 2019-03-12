"use strict";
let getData ={
    installedDrivers : ()=>{
        let installedDrivers = ["dell_driver"];
        return installedDrivers;
    },
    installedWidgets : ()=>{
        let installedWidgets = [];
        return installedWidgets;
    },
    getFoundationVersion:()=>{
        let foundationVersion = '3.0.0';
        return foundationVersion;
    }
}
module.exports = getData;