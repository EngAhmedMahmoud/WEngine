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
    },
    getPages:()=>{
        let pages = [
            {
                name: "operator",
                widgets: [
                    {
                        name: "camera_view",
                        x: 50,
                        y: 50,
                        z: 6,
                        w: "50",
                        h: "50",
                        color: "#42ecb1"
                    },
                    {
                        name: "camera_view",
                        x: 10,
                        y: 10,
                        z: 2,
                        w: "150",
                        h: "150",
                        color: "#e72626"
                    },
                    {
                        name: "layout_view",
                        x: 0,
                        y: 0,
                        z: 1,
                        w: 100,
                        h: 100,
                        color: "#e72626"
                    }
                ]
            },
            {
                name: "Information",
                widgets: [
                    {
                        name: "camera_view",
                        x: 25,
                        y: 25,
                        z: 6,
                        w: "50",
                        h: "50",
                        color: "#42ecb1"
                    },
                    {
                        name: "layout_widget",
                        x: 0,
                        y: 0,
                        z: 1,
                        w: 100,
                        h: 100,
                        color: "#e72626"
                    }
                ]
            },
        ];
        return pages;
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