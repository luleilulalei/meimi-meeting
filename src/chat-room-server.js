let socketIo = require('socket.io');
let http = require('http');
let express = require('express');

let server = http.createServer();
server.listen(3456, "localhost", () => {
    console.log('listen localhost:3456');
});

let io = socketIo.listen(server);

io.sockets.on('connection', socket => {
    console.log('a user connected!');

    socket.on('join', (roomId, username) => {
        console.log('roomId: ', roomId);
        
        socket.join(roomId);
        

        let myRoom = io.sockets.adapter.rooms[roomId];
        let users = 0;
        if(myRoom){
            users = Object.keys(myRoom.sockets).length
        };
        console.log('room: ',roomId, '  ',socket.id +':'+username);
        // socket.to(roomId).emit('joined', room, socket.id); //给房间里的所有人除自己
        socket.to(roomId).emit('joined', roomId, socket.id +':'+username); //给房间里所有人
        // socket.broadcast.emit('joined', room, socket.id); //给站点的所有人
    });

    socket.on('message', (roomId, username, message) => {
        console.log(roomId, username, message);
        socket.to(roomId).emit('receive', username, message);
    })

    socket.on('leave', (roomId) => {
        socket.join(roomId);

        let myRoom = io.sockets.adapter.rooms[roomId];
        let users = 0;
        if(myRoom){
            users = Object.keys(myRoom.sockets).length - 1;
        };
        socket.leave(roomId);

        // socket.to(roomId).emit('joined', room, socket.id); //给房间里的所有人除自己
        socket.in(roomId).emit('joined', room, socket.id); //给房间里所有人
        // socket.broadcast.emit('joined', room, socket.id);
    });

});