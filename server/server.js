const io = require('socket.io').listen(4000);

io.sockets.on('connection', function(socket) {
socket.on('message', function(data) {
    console.log(data);
    socket.broadcast.emit('message', {
        x: data.x,
        y: data.y,
        type: data.type
    });
});
});