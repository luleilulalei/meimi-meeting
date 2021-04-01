<template>
    <div class="hello">
        <div class="video left">
            <p>local</p>
            <button @click="getLocalStream">conn</button>
            <button @click="leave">leave</button>
            <video ref="local" autoplay></video>
        </div>

        <div class="video right">
            <p>remote</p>
            <button>conn</button>
            <button>leave</button>
            <video ref="remote" autoplay></video>
        </div>

        <!-- <video controls autoplay width="300" height="400" ref="camera"></video>
        <button @click="_picture">take photo</button>
        <canvas ref="canvas" width="300" height="400"></canvas> -->

        <!-- <audio ref="audio" controls></audio>
        <select
            name="selector"
            v-model="selectedAudioDeviceIndex"
            @change="showSelectedDevice"
        >
            <option
                v-for="(d, index) in audioDevices"
                :key="index"
                :value="index"
            >
                {{ d.label }}
                {{ selectedAudioDeviceIndex }}
            </option>
        </select> -->
    </div>
</template>

<script>
import socketio from "socket.io";
import http from "http";

export default {
    name: "HelloWorld",
    data() {
        return {
            msg: "Welcome to Your Vue.js App",
            videoDevices: [],
            audioDevices: [],
            selectedAudioDeviceIndex: 0,
            io: socketio.Server,
            localStream: null,
            socket : null,
            btnConn1Disabled: false,
            btnleave1Disabled: true,
            btnConn2Disabled: false,
            btnleave2Disabled: true,
            pc: null,
            state: 'init',
            roomId: '111111'
        };
    },
    mounted() {
        this._initMethod();
        const httpServer = http();
        this.io = new socketio.Server(httpServer);
    },
    methods: {
        leave(){
            if(this.socket) {
                this.socket.emit('leave', '111111');
            }
            this.socket.closeConnection();
            this.closePeerConnection();
            this.closeLocalMedia();
            
        },

        sendMessage(roomId, data){
            console.log('send p2p message', roomid, data);
            if(this.socket){
                this.socket.emit('message', roomId, data);
            }

        },

        getAnswer(desc){
            this.pc.setLocalDescription(desc);
            this.sendMessage(roomid, desc);
        },

        getOffer(desc){
            pc.setLocalDescription(desc);
            sendMessage(this.roomId, desc);

        }, 
        handleOfferError(err){
            console.log('failed to create offer: ', err);
        },

        call(){
            //媒体协商
            if(this.state === 'joined_conn'){
                if(pc){
                    const options = {
                        offerToReceiveVideo: 1,
                        offerToReceiveAudio: 1
                    }
                    pc.createOffer(options)
                        .then(getOffer)
                        .catch(handleOfferError);
                }
            }

        },

        createPeerConnection(){
            console.log('create RTCPeerConnection!');
            if(!this.pc){
                const pcConfig = {
                    'iceServers': [{
                        'urls': 'turn:stun.al.learningrtc.cn:3478',
                        'credential': 'mypass',
                        'username': 'username'
                    }]
                }
                this.pc = new RTCPeerConnection(pcConfig);
                this.pc.onicecandidate = e => {
                    if(e.candidate){
                        //
                        console.log('find a new candidate', e.candidate);
                        this.sendMessage(this.roomId, {
                            type: 'candidate',
                            label: e.candidate.sdpMLineIndex,
                            id: e.candidate.sdpMid,
                            candidate: e.candidate.candidate
                        })
                    }
                }

                this.pc.ontrack = e => {
                    this.$refs.remote.srcObject = e.streams[0];
                }
            }

            if(this.localStream){
                //把自己的媒体流加进 SDP
                this.localStream.getTracks().forEach(track => {
                    this.pc.addTrack(track);
                });
            }
        },

        closePeerConnection(){
            console.log('close RTCPeerConnection!');
            if(this.pc){
                this.pc.close();
                this.pc = null;
            }
        },

        closeLocalMedia(){
            if(this.localStream && this.localStream.getTracks()){
                this.localStream.getTracks().forEach(track => track.stop());
            }
            this.localStream = null;
        },

        handleAnswerError(err){
            console.error('failed to get answer: ', err);
        },

        conn() {
            //连接信令服务
            this.socket = this.io.connect();

            this.socket.on("joined", (roomid, id) => {
                console.log("receive joined message: ", roomid, id);
                this.state = 'joined';
                this.createPeerConnection();
                console.log('current state: ', this.state);
            });

            this.socket.on("otherjoin", (roomid, id) => {
                console.log("receive otherjoin message: ", roomid, id);
                if(state == 'joined_unbind'){
                    this.createPeerConnection();
                }
                this.state = 'joined_conn';
                //媒体协商
            });

            this.socket.on("full", (roomid, id) => {
                console.log("receive full message: ", roomid, id);
                this.state = 'leave'
                console.log("receive full message:state= ", this.state);
                this.socket.disconnect();
                alert('the room is full!');
            });

            this.socket.on("leaved", (roomid, id) => {
                console.log("receive leaved message: ", roomid, id);
            });

            this.socket.on("bye", (roomid, id) => {
                console.log("receive bye message: ", roomid, id);
            });

            this.socket.on("message", (roomid, data) => {
                console.log("receive client message: ", roomid, data);
                //媒体协商
                if(data){
                    if(data.type === 'offer'){
                        this.pc.setRemoteDescription(new RTCSessionDescription(desc));
                        this.pc.createAnswer()
                            .then(getAnswer)
                            .catch(handleAnswerError);
                    }else if(data.type === 'answer'){
                        this.pc.setRemoteDDescription(
                            new RTCSessionDescription(desc)
                        );

                    }else if(data.type === 'candidate'){
                        let candidate = new RTCIceCandidate({
                            sdpMLineIndex: data.label,
                            candidate: data.candidate
                        });
                        this.pc.addIceCandidate(candidate);
                    }else{
                        console.error('unexpected message type')
                    }
                }

            });

            this.socket.emit('join ', '111111');
        },

        async getLocalStream() {
            const constraints = {
                video: true,
                audio: true,
            };
            let devices = await navigator.mediaDevices.getUserMedia(
                constraints
            );
            this.$refs.local.srcObject = devices;
            this.localStream = devices;
            this.conn(); //连接信令服务
        },

        async _initMethod() {
            //video test
            // console.log("hello");
            // navigator.mediaDevices.getUserMedia(deviceType).then((o) => {
            //     this.$refs.camera.srcObject=o;
            //     console.log(o);
            // });
            // navigator.mediaDevices.enumerateDevices().then(o => {
            //   console.log(o);
            // });
            // this._context2d = this.$refs.canvas.getContext("2d")
            // audio test
            // let audioDevices = await navigator.mediaDevices.enumerateDevices();
            // this.audioDevices = audioDevices.filter(
            //     (value) => value.kind === "audioinput"
            // );
            // this.showSelectedDevice();
        },

        async showSelectedDevice() {
            let deviceInfo = this.audioDevices[this.selectedAudioDeviceIndex];
            let stream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: deviceInfo,
            });
            this.$refs.audio.srcObject = stream;
        },

        _picture() {
            this._context2d.drawImage(this.$refs.camera, 0, 0, 300, 400);
        },
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div.video {
    position: absolute;
    width: 40%;
    height: 600px;
}

div.left {
    left: 0%;
}

div.right {
    right: 0%;
}

video {
    width: 100%;
    height: 400px;
}
</style>
