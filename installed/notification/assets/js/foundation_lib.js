var socket = io();
var session_id = $("#shankhar").val();
socket.on("session_id", () => {
  socket.emit(
    "session_id",
    session_id
  );
});


var foundation = new EventEmitter();
foundation.send = function (
  driver_variable_name,
  widget_variable_name,
  method,
  data,
  token
) {
  this.emit("send", driver_variable_name, widget_variable_name, method, data, token);
};

foundation.on("send", function (
  driver_variable_name,
  widget_variable_name,
  method,
  data,
  token
) {
  socket.emit(
    "send",
    driver_variable_name,
    widget_variable_name,
    method,
    data,
    token
  );
});

socket.on("get", function (widget_variable_name, driver_variable_name, data, token) {
  foundation.emit(widget_variable_name, driver_variable_name, data, token);
});
socket.on("get_broadcast", function (driver_variable_name, data, token) {
  foundation.emit("broadcast", driver_variable_name, data, token);
});
