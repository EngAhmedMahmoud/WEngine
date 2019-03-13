const mongoose = require("mongoose");
const schema = mongoose.Schema;
const WidgetConfig = new schema({
    name: {
        type: String,
        required: [true, "Widget Name Required!"]
        
    },
    variableName: {
        type: String,
        required: [true, "VariableName Required!"],
        index: true,
        unique: true
    },
    description: {
        type: String,
        default: "description"
    },
    version: {
        type: String,
        required: [true, "Version Required!"]
    },
    minFoundationVersion: {
        type: String,
        required: [true, "Minimum Foundation Version Required!"]
    },
    entry_point: {
        type: String,
        required: [true, "Entry Point Required!"]
    },
    dep_drivers: [
        {
            variable_name: String,
            version: String
        }
    ],
    dep_widgets: [
        {
            variable_name: String,
            version: String
        }
    ],
    size: {
        min: {
            width: Number,
            height: Number
        },
        max: {
            width: Number,
            height: Number
        }
    },
    location: {
        x: String,
        y: String
    },
    langs: {
        en_US: Boolean,
        ar_EG: Boolean,
        es_ES: Boolean,
        de_DE: Boolean,
        fr_FR: Boolean,
    },
    styles: [String],
    scripts: [String],
    visibility:{
        type:Boolean,
        default:1
    }

});
module.exports = mongoose.model('Widget', WidgetConfig, "widgets");