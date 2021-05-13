<template>
    <div class="meeting">
        <div class="big-screen">
            <video v-show="!showWhiteBoard" class="main-video" ref="main-video" autoplay></video>
        </div>
        <div class="right">
            <el-container>
                <el-main
                    style="
                        width: 100%;
                        height: 100%;
                        padding: 0;
                        margin: 0;
                        position: absolute;
                    "
                >
                    <white-board v-if="showWhiteBoard" style="position: absolute;z-index:100">
                        <template v-slot:header>
                            <el-button type="danger" @click="stopShareBoard">结束共享</el-button>
                        </template>
                    </white-board>

                    <el-row style="top:0;position:absolute;width:100%">
                        <img src="/static/logo-new.png" style="width:80px;height:80px;opacity: 0.7;">
                    </el-row>
                    <el-row v-show="!showWhiteBoard">
                        <el-col :span="3" :push="21">
                            <el-tooltip class="item" effect="dark" placement="left">
                                <div slot="content">{{joinName}}</div>
                                <video @click="showMe" class="min-list" ref="mainMin" autoplay></video>
                            </el-tooltip>
                            <el-button
                                class="page-icon"
                                type="text"
                                plain
                                circle
                                icon="el-icon-arrow-up"
                                style="margin-top:30px"
                            ></el-button>
                            
                            <div v-for="offset in pageSize" :key="offset">
                                 <el-tooltip v-if="(offset - 1 + pageSize * page) < count" class="item" effect="dark" placement="left">
                                     {{others[offset -1  + pageSize * page].joinName}}
                                    <div slot="content">{{others[offset -1  + pageSize * page].joinName}}</div>
                                    <video @click="showOnBigScreen(offset -1 + pageSize * page)" autoplay v-if="(offset -1 + pageSize * page) < count && others[offset + pageSize * page -1].video" class="min-list" :ref="'user' + (offset-1)"></video>
                                    <span v-else-if="(offset - 1 + pageSize * page) < count" class="min-list">
                                        {{others[offset -1  + pageSize * page].joinName.substr(0, 1)}}
                                    </span>
                                </el-tooltip>
                            
                            </div>
                            <el-button
                                class="page-icon"
                                type="text"
                                plain
                                circle
                                icon="el-icon-arrow-down"
                            ></el-button>
                        </el-col>
                    </el-row>
                    <el-row v-show="!showWhiteBoard" style="bottom:5%;position:fixed;width:100%">
                        <el-col :push="2" :span="3">
                            <el-button type="text" plain circle class="el-icon-chat-dot-square page-icon" @click="showDrawer = true"></el-button>
                            <el-button type="text"
                                plain v-if="!showShared" circle class="el-icon-s-platform page-icon" @click="sharePlatform"></el-button>
                            <el-button size="mini" v-else type="danger" @click="stopShare">结束共享</el-button>
                            <el-button type="text"
                                plain style="color: #fff" circle class="el-icon-s-open page-icon" @click="shareBoard"></el-button>
                        </el-col>
                        <!-- <el-col :push="2" :span="2">
                        </el-col> -->
                        <el-col :push="8" :span="3">
                            <el-button class="microphone-btn" v-if="turnonMicrophone" circle icon="el-icon-microphone" @click="clickturnDownMicrophone"></el-button>
                            <el-button class="microphone-btn" v-else circle icon="el-icon-turn-off-microphone" @click="clickturnOnMicrophone"></el-button>
                            <el-button circle class="hangup-btn" @click="leave">
                                <img src="/static/phone-hang-up-white.png" style="width:14px;height:12px">
                            </el-button>
                            <el-button v-if="turnonVideoCamera" circle icon="el-icon-video-camera" @click="clickturnDownVideoCamera"></el-button>
                            <el-button v-else circle @click="clickturnOnVideoCamera">
                                <img style="width:14px;height:12px;" src="/static/turnoffcamera.png">
                            </el-button>
                        </el-col>
                    </el-row>
                </el-main>
            </el-container>
        </div>
        <chat-drawer :recordContent='chatRecords' :drawer='showDrawer' @change-drawer="closeChatDrawer" @say='sayTo'>
        </chat-drawer>
    </div>
</template>

<script>
import WhiteBoard from './WhiteBoard'
import ChatDrawer from './ChatDrawer'

export default {
    name: "Meeting",
    components: {
        WhiteBoard,
        ChatDrawer
    },
    data() {
        return {
            roomId: "",
            mode: "compere", //主持人 compere、 画廊
            joinName: "",
            page: 0,
            pageSize: 3,
            count: 0,
            others: [],
            localStream: null,
            sharedStream: null,
            showLayer: false,
            turnonMicrophone: true,
            turnonVideoCamera: true,
            currentState: '', // init  joined  connect-one connect-multi 
            localSocket: null,
            localPCs: [],
            videoDevice: null,
            showShared: false,
            showWhiteBoard: false,
            showDrawer: false,
            chatRecords: []
        };
    },
    methods: {
        async _initRoom() {
            this.roomId = this.$route.params.roomId;

            this.joinName = sessionStorage.getItem('joinName');
            this.joinName = this.joinName? this.joinName : 'luleilulalei';
            
            this.$set(this.$data, 'turnonMicrophone', eval(sessionStorage.getItem('turnonMicrophone')));
            this.$set(this.$data, 'turnonVideoCamera', eval(sessionStorage.getItem('turnonVideoCamera')));

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            this.videoDevice = videoDevices.length >0?videoDevices[0]:null;

            let localStream = await navigator.mediaDevices.getUserMedia({
                video: this.videoConf,
                audio: true,
            });

            this.$refs['main-video'].srcObject = localStream;
            this.$refs.mainMin.srcObject = localStream;
            this.localStream = localStream;
            console.log('local stream: ', localStream);
            console.log('local stream tracks: ', localStream.getTracks());

            this.renderVideo();
            this.renderAudio();
            this.joinRoom();
        },
        renderVideo(){
            let videoTracks = this.localStream.getVideoTracks();
            if(videoTracks.length !==0){
                if(this.turnonVideoCamera){
                    // videoTracks[0].applyConstraints({video: this.videoConf});
                    videoTracks[0].enabled = true;
                }else{
                    // videoTracks[0].applyConstraints({video: false});
                    videoTracks[0].enabled = false;
                }
            }
        },
        renderAudio(){
            let audioTracks = this.localStream.getAudioTracks();
            if(audioTracks.length !==0){
                if(this.turnonMicrophone){
                    audioTracks[0].enabled = true;
                }else{
                    audioTracks[0].enabled = false;
                }
            }
        },
        async renderUserMinList(){
            for(let offset =0;offset<this.pageSize;offset++){
                let refName = 'user' + offset;
                let current = offset + this.pageSize* this.page
                if(current< this.count && this.others[current].video){
                    if(this.$refs.hasOwnProperty(refName)){
                        this.$refs[refName][0].srcObject = this.others[current].stream
                    }
                }
            }
        },

        joinRoom(){
            // const SIGNAL_SERVER = 'https://8.131.49.214'; //prod
            const SIGNAL_SERVER = 'http://localhost:3456'; //dev

            this.localSocket = this.$socketIoClient(SIGNAL_SERVER);

            // this.localSocket.connect()
            console.log(this.localSocket);

            this.localSocket.emit('join', this.roomId, this.joinName)
            
            this.localSocket.on('joined', (roomId, localSocketId, roomSockets) => {
                roomSockets.forEach(socketId => {
                    if(localSocketId !== socketId){
                        //把自己移除掉
                        //call 房间里的每个人
                        this.call(socketId);
                    }else{
                        console.log('get me: ', localSocketId);
                    }
                })
            })

            this.localSocket.on('other-joined', (roomId, socketId, hisJoinName) => {
                this.$message(`${hisJoinName} 加入了房间`);
                this.chatRecords.push({
                    nickName: this.getPersonBySocketId(socketId).joinName,
                    timestamp: '',
                    contactText: msg,
                    mineMsg: false
                })
            })

            this.localSocket.on('recv-offer', (socketId, hisJoinName, remoteDesc) => {
                //新人加入
                let pc = this.createPC(socketId, hisJoinName)
                
                // this.localPCs[socketId] = pc
                this.getPersonBySocketId(socketId).pc = pc

                //console.log(`recv-offer from ${socketId}: + ${JSON.stringify(remoteDesc)}`)
                pc.setRemoteDescription(remoteDesc)
                const answerOption = {
                    iceRestart: false,
                    offerToReceiveAudio: 1,
                    offerToReceiveVideo: 1
                }
                pc.createAnswer(answerOption).then(desc => this.handleAnswer(socketId, desc)).catch(this.handleAnswerErr)
            })

            this.localSocket.on('recv-answer', (socketId, hisJoinName, remoteDesc) => {
                // this.localPCs[socketId].pc.setRemoteDescription(desc) //设置远端
                //console.log(`recv-answer from ${socketId}: + ${JSON.stringify(remoteDesc)}`);
                this.getPersonBySocketId(socketId).pc.setRemoteDescription(remoteDesc); //设置远端
                this.getPersonBySocketId(socketId).joinName = hisJoinName; //设置远端
            })

            this.localSocket.on('recv-candidate', (socketId, candidate)=> {
                // this.localPCs[socketId].pc.addIceCandidate(candidate)
                //console.log(`recv-candidate from ${socketId}: + ${JSON.stringify(candidate)}`)
                let icecandidate = new RTCIceCandidate({
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: candidate.candidate
                });
                this.getPersonBySocketId(socketId).pc.addIceCandidate(icecandidate);
            })

            this.localSocket.on('recv-bye', (socketId) => {
                this.removeOtherBySocketId(socketId);
                this.count--;
                this.page = this.page<this.pageCount?this.page:this.pageCount;
                this.renderUserMinList();
            })

            this.localSocket.on('recv-leaved', socketId => {
                for(let key in Object.keys(this.others)){
                    this.others[key].pc.close();
                }
                this.others = [];
                this.localSocket.close();
                this.$router.push('/');
            })

            this.localSocket.on('recv-say', (socketId, msg) => {
                this.chatRecords.push({
                    nickName: this.getPersonBySocketId(socketId).joinName,
                    timestamp: '',
                    contactText: msg,
                    mineMsg: false
                })
            })
        },

        showOnBigScreen(index){
            this.$refs['main-video'].srcObject = this.others[index].stream;
        },

        showMe(){
            this.$refs['main-video'].srcObject = this.$refs.mainMin.srcObject;
        },

        leave(){
            this.localSocket.emit('leave', this.roomId)
        },

        createPC(socketId, joinName){
            this.others.push({
                socketId: socketId,
                joinName: joinName,
                video: true,
                audio: true,
                stream: null,
                pc: null
            })
            this.count++;

            const PC_CONFIG = {
                iceServers: [
                    {
                        urls: "turn:8.131.49.214:3478",
                        credential: "qjk",
                        username: "123456",
                    }
                ]
            }

            let newPc = new RTCPeerConnection(PC_CONFIG);

            this.getPersonBySocketId(socketId).pc = newPc;

            newPc.onicecandidate = (e) => {
                if(e.candidate){
                    this.sendIceCandidate(socketId, {
                        sdpMLineIndex: e.candidate.sdpMLineIndex,
                        candidate: e.candidate.candidate
                    }) //把这个传到远端
                }
            };

            newPc.ontrack = streamObject => this.handleRemoteStream(socketId, streamObject);

            this.localStream
                .getTracks()
                .forEach(track =>
                    newPc.addTrack(track, this.localStream)
                );

            return newPc;
        },
        handleRemoteStream(socketId, streamObject){
            // console.log('recv-remote-stream from '+socketId, streamObject)
            console.log('occur addTrack: ', socketId, streamObject);
            this.getPersonBySocketId(socketId).stream = streamObject.streams[0];
            this.renderUserMinList();
            // let index = this.keyMapIndexOthers[socketId]
            // if(index >= (this.pageSize-1)*this.page && index < this.pageSize*this.page){
            //     this.$refs[]
            // }
        },

        call(socketId){
            let newPc = this.createPC(socketId, '获取中...')
            
            //媒体协商
            const offerOption = {
                iceRestart: false,
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            }

            newPc.createOffer(offerOption).then(desc => this.handleOffer(socketId, desc)).catch(this.handelOfferErr);
        },
        sendOffer(socketId, desc){
            this.localSocket.emit('send-offer', socketId, this.joinName, desc)
        },
        sendAnswer(socketId, desc){
            this.localSocket.emit('send-answer', socketId, this.joinName, desc)
        },
        sendIceCandidate(socketId, candidate){
            this.localSocket.emit('exchange-icecandidate', socketId, candidate)
        },
        handleOffer(socketId, desc){
            this.getPersonBySocketId(socketId).pc.setLocalDescription(desc)
            //console.log('build offer desc: '+ JSON.stringify(desc))
            this.sendOffer(socketId, desc)
        },
        handleAnswer(socketId, desc){
            this.getPersonBySocketId(socketId).pc.setLocalDescription(desc)
            //console.log('build answer desc: '+ JSON.stringify(desc))
            this.sendAnswer(socketId, desc)
        },
        handelOfferErr(e){
            console.log(e)
        },
        handleAnswerErr(e){
            console.log(e)
        },
        getPersonBySocketId(socketId){
            return this.others[this.keyMapIndexOthers[socketId]]
        },
        removeOtherBySocketId(socketId){
            let beRemoved = this.getPersonBySocketId(socketId);
            //console.log(beRemoved);
            if(beRemoved && beRemoved.hasOwnProperty('pc') && beRemoved.pc){
                beRemoved.pc.close(); //关闭连接
            }
            this.$message(`${beRemoved.joinName} 离开了房间`)
            this.others.splice(this.keyMapIndexOthers[socketId], 1);
        },
        clickturnOnVideoCamera(){
            this.turnonVideoCamera=true;
            this.renderVideo();
        },
        clickturnDownVideoCamera(){
            this.turnonVideoCamera=false;
            this.renderVideo();
        },
        clickturnOnMicrophone(){
            this.turnonMicrophone=true;
            this.renderAudio();
        },
        clickturnDownMicrophone(){
            this.turnonMicrophone=false;
            this.renderAudio();
        },
        sharePlatform(){
            let self = this;
            navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: 1920,
                    height: 603
                },
                audio: true
            }).then(stream => {
                self.sharedStream = stream;
                self.$refs['main-video'].srcObject = self.sharedStream;
                self.$refs.mainMin.srcObject = stream;
                console.log('shared stream: ', stream);
                console.log('shared stream tracks: ', stream.getTracks());
                self.showShared = true;
                self.others.forEach(member => {
                    console.log(member.pc.getSenders());
                    for(let i in member.pc.getSenders()){
                        let sender = member.pc.getSenders()[i];
                        let filterTrack = self.sharedStream.getTracks().filter(track => track.kind == sender.track.kind);
                        if(filterTrack.length != 0 && filterTrack.kind == 'video'){
                            console.log('replace sender track: ', sender, filterTrack[0]);
                            sender.replaceTrack(filterTrack[0]);
                        }
                    }
                })
            });
        },
        changeVideoTrack(){
            this.showShared = false;
            this.$refs['main-video'].srcObject = this.localStream;
            this.$refs.mainMin.srcObject = this.localStream;

            this.others.forEach(member => {
                console.log(member.pc.getSenders());
                for(let i in member.pc.getSenders()){
                    let sender = member.pc.getSenders()[i];
                    let filterTrack = this.localStream.getTracks().filter(track => track.kind == sender.track.kind);
                    if(filterTrack.length != 0){
                        sender.replaceTrack(filterTrack[0]);
                    }
                }
            })
        },
        stopShare(){
            this.changeVideoTrack();
        },
        shareBoard(){
            this.showWhiteBoard = true;
            this.sharePlatform();
        },
        stopShareBoard(){
            this.showWhiteBoard = false;
            this.changeVideoTrack();
        },
        closeChatDrawer(val){
            this.showDrawer = val;
        },
        sayTo(msg){
            let self = this;
            this.localSocket.emit('say', self.roomId, msg);
            this.chatRecords.push({
                nickName: self.joinName,
                timestamp: '',
                contactText: msg,
                mineMsg: true
            })
        }
    },
    mounted() {
        this._initRoom();
    },
    computed: {
        keyMapIndexOthers: function() {
            let map = {};
            for(let index in this.others){
                map[this.others[index].socketId] = index;
            }
            return map;
        },
        pageCount: function(){
            return parseInt((this.count-1)/this.pageSize)+1;
        },
        videoConf: function(){
            return  {
                deviceId: this.videoDevice.deviceId,
                width: 1920,
                height: 603
            };
        }
    }
};
</script>

<style scoped>
div.big-screen {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #303133;
    z-index: -1;
}

video.main-video {
    width: 100%;
    height: 100%;
    opacity: 0.6;
}

/* .el-button, .el-button:focus:not(.el-button:hover){ 
    margin-right: 12px;
    border: 1px solid #2794f8;
    border-radius: 2px;
    box-shadow: 0 2px 4px 0 #f4f4f4;
    color: #2794f8;
    background: white;
} */



.min-list {
    width: 173.33px;
    height: 81.66px;
    padding: 0px;
    margin: 5px;
    border-radius: 4px;
    display: block;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(161, 157, 157, 0.603),
        0 0 6px rgba(161, 157, 157, 0.603);
}

.min-list:hover {
    box-shadow: 0 2px 4px rgba(148, 165, 221, 0.705),
        0 0 6px rgba(148, 165, 221, 0.705);
}

.page-icon {
    color: #fff;
    /* display: block; */
    margin: 0 auto;
}

.page-icon:hover {
    color: #fff;
    background-color: rgba(107, 195, 235, 0.527);
    border: none;
}

.layer {
    position: absolute;
    padding: 0;
    margin: 0;
    z-index: 12;
    width: 100%;
    height: 100%;
}

.microphone-btn {
    background-color: rgba(127, 127, 209, 0.801);
    color: #fff;
    border: none;
}

.hangup-btn{
    background-color: red;
    border: none;
}
</style>