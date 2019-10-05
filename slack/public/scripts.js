    const socket = io('http://localhost:9000');


    console.log(socket.io)
    socket.on('connect',()=>{
        console.log(socket.id);
    })
    
    socket.on('nsList',(nsData)=>{
        console.log("The list of namespaces has arrived")
        // console.log(nsData)
        let namespacesDiv = document.querySelector('.namespaces');
        namespacesDiv.innerHTML = "";
        nsData.forEach((ns)=>{
            namespacesDiv.innerHTML += `<div class ="namespace"><img src="${ns.img}" /></div>`
        })
        console.log(document.getElementsByClassName('namespace'))
        document.getElementsByClassName('namespace'),forEach((elem)=>{

        })

    })

    socket.on('messageFromServer',(dataFromServer)=>{
        console.log(dataFromServer);
        socket.emit('dataToServer',{data: "Data from the Client!"})
    })

    document.querySelector('#message-form').addEventListener('submit',(event)=>{
        event.preventDefault();
        const newMessage = document.querySelector('#user-message').value;
        socket.emit('newMessageToServer',{text: newMessage})
    })

    sockey.on('messageToClients',(msg)=> {
        console.log(msg);
        document.querySelector('#messages').innerHTML += `<li>${msg.text}</li>`
    })

