var context = {maxLines : 100};
function tail(host) {
  $("#console").show();
  if (context.socket) {
    context.socket.emit('disconnect', {host : context.host});
  }
  context.host = host;
 
  context.socket = io.connect();
  context.socket.on('nohup', function (data) {
    if (data.log && typeof(data.log) != 'object' && data.host == host) {
      var lines = data.log.split("\n");
      var totalLines = $("#console li").length + lines.length;
      if (totalLines > context.maxLines) {
        $("#console li:lt(" + (totalLines - context.maxLines) + ")").remove();
      }
      for (var i in lines) {
        $("#console ul").append('<li>' + lines[i] + "</li>");
      }
      $(document).scrollTop($(document).height());
      $('#console').scrollTop($('#console')[0].scrollHeight);
    }
  });
  context.socket.emit('tail', { host: host });
}