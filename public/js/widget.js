"use strict"
const hide = ['fa-eye-slash', 'text-muted'];
const show = ['fa-eye', 'text-success'];
const URL  = '/widgetVisiability';


function showHide(w_id) {
    // switch activation icon
    const widget = $(`#${w_id}`);
    var data = { "widgetName" : `${w_id}`};
        $.ajax({
            type: "POST",
            url: URL,
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                let state = data.data;
                if (state) {
                    widget.removeClass(hide).addClass(show);
                } else {
                    widget.removeClass(show).addClass(hide);
                }
            },
            failure: function(errMsg) {
                alert(errMsg);
            }
        });
    
}
