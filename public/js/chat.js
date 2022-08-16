const socket = io()
let userID='user';
let currentUsers=['user'];

function setCurrentUsersLocal(){
    console.log(currentUsers)
    const currentUsersDiv = document.querySelector('.currentUsers')
    while(currentUsersDiv.firstChild){ //empties out list
        currentUsersDiv.removeChild(currentUsersDiv.firstChild)
    }
    currentUsers.map((user)=>{ //populates with currentUsers array
        let userNode = document.createElement('p');
        userNode.innerHTML=user
        currentUsersDiv?.appendChild(userNode)
    })
}

document.querySelector('#dogFactButton').addEventListener('click',()=>{

})


socket.on('newMessage', (message)=>{ //when a message is received from server
    let messageNode = document.createElement('p');
    messageNode.innerHTML = message;
    document.querySelector('#chatHistory')?.prepend(messageNode);
})

socket.on('updateUsers',(currentUsersOnServer)=>{
    //iterate through map and get the values
    currentUsers=[]
    console.log(currentUsersOnServer)
    for(const socketID in currentUsersOnServer){
        currentUsers.push(currentUsersOnServer[socketID])
    }
    setCurrentUsersLocal();
})
const messageForm = document.querySelector('#message')
messageForm.addEventListener('submit', (event) => { //send a message to server
    console.log(event)
    event.preventDefault()
    const {target} = event
    if(target){
        const message = userID + ': ' + target.message.value;
        socket.emit('sendMessage', message)
        const messageInput = document.getElementById('messageInput')
        messageInput.value=''
    }
})

const nameChangeForm = document.querySelector('#settings')
nameChangeForm.addEventListener('submit',(event)=>{ //setting name in chat and sending to server
    event.preventDefault();
    const previousName = userID;
    const {target} = event
    if(target){
        userID = target.username.value;
    }
    currentUsers = currentUsers.filter(username=> username !== previousName)
    currentUsers.push(userID)
    setCurrentUsersLocal()
    let userOutput = document.getElementById('currentUser')
    let userLabel =  document.querySelector('.usernameLabel')
    if(userOutput){
        userOutput.innerHTML = `Current User: ${userID}`;
    }
    if(userLabel){
        userLabel.innerHTML = userID
    }
    socket.emit('sendMessage', `${previousName} has changed name to ${userID}` )
    socket.emit('updateUsersServer', userID)
})