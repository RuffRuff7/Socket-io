const express = require('express');
const app = express();
const socketio = require('socket.io')

let namespaces = require('./data/namespaces');
// console.log(namespaces);
app.use(express.static(__dirname + '/public'));
const expressServer = app.listen(9000);
const io = socketio(expressServer);

io.on('connection',(socket)=>{
    // console.log(socket.handshake);
    let nsData = namespaces.map((ns)=> {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    })
    // console.log(nsData)
    socket.emit('nsList',nsData)
}) 

namespaces.forEach((namespace)=> {
    // console.log(namespace);
    io.of(namespace.endpoint).on('connection',(nsSocket)=> {
        console.log(nsSocket.handshake); 
        const username = nsSocket.handshake.query.username;
        // console.log(`${nsSocket.id} has joined ${namespace.endpoint}`)
        nsSocket.emit('nsRoomLoad',namespace.rooms);
        nsSocket.on('joinRoom',(roomToJoin,numberOfUsersCallback)=>{
            console.log(nsSocket.room);
            const roomToLeave = Object.keys(nsSocket.rooms)[1];
            nsSocket.leave(roomToLeave);
            updateUsersInRoom(namespace, roomToLeave);
            nsSocket.join(roomToJoin);
            // io.of('/wiki').in(roomToJoin).clients((error, clients)=>{
            //     console.log(clients)
            //     numberOfUsersCallback(clients.length);
            // })
            const nsRoom = namespace.rooms.find((room)=>{
                return room.roomToLeave === roomToJoin;
            })
            nsSocket.emit('historyCatchUp', nsRoom.history);
            updateUsersInRoom(namespace, roomToJoin);
        })
        nsSocket.on('newMessageToServer',(msg)=>{
            const fullMsg = {
                text: msg.text,
                time: Date.now(),
                username: username,
                avatar: 'https://via.placeholder.com/30'
            }
            // console.log(fullMsg);
            // console.log(nsSocket.rooms);
            const roomToLeave = Object.keys(nsSocket.rooms)[1];
            const nsRoom = namespace.room.find((room)=>{
                return room.roomToLeave === roomToLeave;
            })
            // console.log("The room object that we made that matches this NS room is...")
            // console.log(nsRoom);
            nsRoom.addMessage(fullMsg);
            io.of(namespace.endpoint).to(roomToLeave).emit('messageToClients',msg);
        })
    })
})

function updateUsersInRoom(namespace, roomToJoin) {
    io.of(namespace.endpoint).in(roomToJoin).clients((error, clients)=>{
        console.log(`There are ${clients.length} in this room`);
        io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers',clients.length);
    })
}
