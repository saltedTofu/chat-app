const path = require('path') //core module
const http = require('http') //core module
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server) //socket io expects raw http server, so express must be set up this way

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

let currentUsersOnServer = {}

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{ //runs when sockets gets new connection
    console.log('New WebSocket Connection with ID: ' + socket.id)
    currentUsersOnServer[socket.id] = 'user'//sets object of users
    socket.emit('newMessage','Welcome to the Chat') //sends to only current client
    io.emit('updateUsers',currentUsersOnServer) //sets all clients currentUsers array to match server
    socket.broadcast.emit('newMessage','A new user has joined!')//send to all clients except current client

    socket.on('sendMessage', (message)=>{
        io.emit('newMessage',message) //sends to all clients including current client
    })

    socket.on('updateUsersServer', (userID)=>{ //runs when name is changed
        currentUsersOnServer[socket.id] = userID //updates on server
        socket.broadcast.emit('updateUsers',currentUsersOnServer) //sends to all clients
    })

    socket.on('disconnect',(reason)=>{ //built in event 'disconnect' when client d/c's
        io.emit('newMessage','A user has left!')
        delete currentUsersOnServer[socket.id] //removes user from map
        console.log(socket.id + ' has left due to ' + reason)
        io.emit('updateUsers',currentUsersOnServer) //updates all clients user arrays
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})

