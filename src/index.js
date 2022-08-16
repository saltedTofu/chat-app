const path = require('path') //core module
const http = require('http') //core module
const express = require('express')
const socketio = require('socket.io')
const mongoose = require('mongoose')
const Message = require('../schema/message') //imports message schema

const app = express()
const server = http.createServer(app)
const io = socketio(server) //socket io expects raw http server, so express must be set up this way

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

let currentUsersOnServer = {}

app.use(express.static(publicDirectoryPath))

mongoose.connect('mongodb://localhost:27017/db', ()=>{ //connecting to mongoDB
    console.log('connected to db')
},()=>{
    console.log('unable to connect to db')
});

io.on('connection',(socket)=>{ //runs when sockets gets new connection
    console.log('New WebSocket Connection with ID: ' + socket.id)
    currentUsersOnServer[socket.id] = 'user'//sets object of users
    socket.emit('newMessage','Welcome to the Chat') //sends to only current client

    //send to current client all messages previously sent
    /*
        query db to get all messages
    */
    async function getMessagesFromDB(){
        let currentDate = new Date()
        const messages = await Message.find() //returns an array with all of the message objects in last 24 hours
        socket.emit('previousMessages',messages)
    }
    getMessagesFromDB()

    io.emit('updateUsers',currentUsersOnServer) //sets all clients currentUsers array to match server
    socket.broadcast.emit('newMessage','A new user has joined!')//send to all clients except current client

    socket.on('sendMessage', (message)=>{ //runs when client sends a message to the server
        io.emit('newMessage',message) //sends to all clients including current client
        async function saveMessageToDB(){
            let username=[]
            let messageText=[]
            let messageStart=false
            for(let i=0;i<message.length;i++){
                if(message[i]!==':' && !messageStart){
                    username.push(message[i])
                }
                else if(message[i]===':'){
                    messageStart=true
                }
                else{
                    messageText.push(message[i])
                }
            }
            username=username.join('')
            messageText=messageText.join('')
            console.log(username)
            console.log(messageText)
            const newMessage = new Message({text:messageText,sender:username})
            try{
                await newMessage.save()
            }catch{
                console.log('Unable to save message to database.')
            }
        }
        saveMessageToDB()
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

