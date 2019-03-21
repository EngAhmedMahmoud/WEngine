"use strict";
let getData ={
    installedDrivers : ()=>{
        let installedDrivers =  [];
        return installedDrivers;
    },
    installedWidgets : ()=>{
        let installedWidgets = ["btWidget","layout_widget"];
        return installedWidgets;
    },
    getFoundationVersion:()=>{
        let foundationVersion = '3.0.0';
        return foundationVersion;
    },
    getLocale:()=>{
        let language = "en_US";
        if(language){
            return language;
        }else{
            return "en_US";
        }
    }
}
module.exports = getData;