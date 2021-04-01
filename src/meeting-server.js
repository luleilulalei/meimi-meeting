let socketIo = require('socket.io');
let http = require('http');
let express = require('express');

let server = http.createServer();
server.listen(3456, "127.0.0.1",() => {
    console.log('listen localhost:3456');
});

let io = socketIo.listen(server);

io.sockets.on('connection', socket => {
    socket.on("join", (roomId, username) => {
        socket.join(roomId);

        let joinedRoom = io.sockets.adapter.rooms[roomId]; //房间

        socket.emit('joined', roomId, socket.id, Object.keys(joinedRoom.sockets)); //向新加入者发送原有的所有socket id

        let users = joinedRoom ? Object.keys(joinedRoom.sockets).length : 0;
        if (users > 1) {
            socket.in(roomId).emit('other-joined', roomId, socket.id, username); //发给其他人，有人加入
        }
        console.log(`room: ${roomId}  a user: ${username} socketId: ${socket.id} joined`);
        console.log(`room: ${roomId}  custom users number: ${users}`);
    });

    socket.on('send-offer', (socketId, desc) => {
        io.to(socketId).emit('recv-offer', socket.id, desc); //告诉是哪个socket发的offer
        console.log(`${socket.id} send offer to ${socketId}`);
        console.log(`offer content: ${desc}`);
    });

    socket.on('send-answer', (socketId, desc) => {
        io.to(socketId).emit('recv-answer', socket.id, desc); //告诉是哪个socket发的answer
        console.log(`${socket.id} send answer to ${socketId}`);
        console.log(`answer content: ${desc}`);
    });

    socket.on('exchange-icecandidate', (socketId, candidate) => {
        io.to(socketId).emit('recv-candidate', socket.id, candidate); //告诉是哪个socket发的answer
        console.log(`${socket.id} send icecandidate to ${socketId}`);
        console.log(`icecandidate content ${candidate}`);
    });

    socket.on('message', (roomId, message) => {
        socket.in(roomId).emit('message', socket.id, message); //P2P 转发, 转发 icecandidate
    });

    socket.on('leave', (roomId) => {
        socket.in(roomId).emit('recv-bye', socket.id);
        socket.emit('recv-leaved', roomId, socket.id);
        socket.leave(roomId);
        console.log(`${socket.id} send bye to room:${roomId}`);
        let joinedRoom = io.sockets.adapter.rooms[roomId]; //房间
        let membersCount = joinedRoom? Object.keys(joinedRoom.sockets).length:0;
        console.log(`room:${roomId} current members number: ${membersCount}`);
    });
});

io.on('disconnection', socket => {
    console.log(`${socket.id} disconnect`)
    // socket.in(roomId).emit('recv-bye', socket.id);
    // socket.leave(roomId);
    // let joinedRoom = io.sockets.adapter.rooms[roomId]; //房间
    // if(joinedRoom) {
    //     console.log(`room:${roomId} current members number: ${joinedRoom.sockets.length}`);
    // }
    // console.log(`${socket.id} send bye to room:${roomId}`);
});

