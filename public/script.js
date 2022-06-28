const socket = io('/');

const videoGrid=document.getElementById('video-grid');
console.log(videoGrid);
//html element for video
const myVideo = document.createElement('video');
myVideo.muted=true;

var peer = new Peer(undefined,{
    path: '/peerjs',
    host: '/',
    port: '443'
});

let myVideoStream

//gets audio and video from chrome
//promise which is either rejected or accepted in future
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    myVideoStream=stream;
    addVideoStream(myVideo,stream);

    peer.on('call',call=>{
        //answer to the video stream
        call.answer(stream)
        const video=document.createElement('video')
        //and add it to stream
        call.on('stream', userVideoStream=>{
            addVideoStream(video,userVideoStream)
        })
    })

    socket.on('user-connected',(userId)=>{
        connecToNewUser(userId,stream);
    })


    let text= jQuery('input');

    jQuery('html').keydown((e)=>{
        if(e.which==13 && text.val().length!=0){
            socket.emit('message',text.val());
            text.val('');
        }
    })

    //front end chat is receiving message from server
    socket.on('createMessage',message=>{
        jQuery('.messages').append(`<li class"message"><b>user</b><br/>${message}</li>`);
        scrollToBottom();
    })
    
})

//generates id
peer.on('open',id=>{
    //for joining the room
    socket.emit('join-room',ROOM_ID,id);
})




const connecToNewUser = (userId,stream) =>{
    const call=peer.call(userId,stream);
    const video= document.createElement('video');
    //other user's stream & video element
    call.on('stream',userVideoStream=>{
        addVideoStream(video,userVideoStream)
    })
}

//play the video stream
const addVideoStream =(video,stream) =>{
    video.srcObject=stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();
    })
    videoGrid.append(video);
}

// responsible for scroll in chat window
const scrollToBottom = () => {
    let d = jQuery('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

// mute audio
const muteUnmute = () =>{
    const enabled = myVideoStream.getAudioTracks()[0].enabled;

    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }else{
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

// start or stop video
const playStop = () =>{
    const enabled = myVideoStream.getVideoTracks()[0].enabled;

    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    }else{
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
        <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}