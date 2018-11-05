const io = require('socket.io').listen(4000);

io.sockets.on('connection', function(socket) {
socket.on('message', function(data) {
  //  console.log(data);
    socket.broadcast.emit('message', {
        x0: data.x0,
        y0: data.y0,
        x1: data.x1,
        y1: data.y1,
        type: data.type,
        colour: data.colour
    });
});
});