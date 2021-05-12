<template>
    <div class="index">
        <el-container>
            <el-main id="main-background">
                <el-row style="top: 5%">
                    <el-col :span="4" :push="2">
                        <span style="font-size: 20px; color: #fff">美米会议</span>
                    </el-col>
                    <el-col :span="2" :push="13">
                        <img src="/static/logo.png" style="width:175px;height:175px">
                    </el-col>
                </el-row>
                <el-row class="room-number" style="top:6%">
                    <el-col :push="16" :span="5">
                        <el-input :style="shadow" v-model="roomNumber" placeholder="请输入房间号"></el-input>
                    </el-col>
                </el-row>
                <el-row class="opt" style="top: 11%">
                    <el-col :push="16" :span="2">
                        <el-button @click="quickMeeting" :style="shadow" type="primary">
                           <i class="el-icon-video-camera"></i> 快速会议
                        </el-button>
                    </el-col>
                    <el-col :push="17" :span="2">
                        <el-button @click="joinMeeting" :style="shadow" type="success">
                           <i class="el-icon-user"></i> 加入会议
                        </el-button>
                    </el-col>
                </el-row>
                <el-dialog id="video-dialog" :visible.sync="dialogVisible" style="padding: 0;margin:0">
                    <div id="dialog-video" style="backgroud-color: #fff;width:100%;height:100%;" v-show="turnonVideoCamera">
                        <video  autoplay ref="videoBackup" style="position: relative;width:100%;height:100%;"></video>
                    </div>
                    <el-row style="top: 30%; position: relative; width:100%">
                        <el-col :push="6" :span="12">
                                <el-input v-model="joinName" placeholder="请输入参会名称"> 
                                <i slot="prefix" class="el-input__icon el-icon-user"></i>
                            </el-input>
                        </el-col>
                        <el-col :push="7" :span="2">
                            <el-button @click="jump" :style="shadow" type="primary">
                                <i class="el-icon-video-camera"></i> 进入会议
                            </el-button>
                        </el-col>
                    </el-row>
                    <el-row style="bottom:5%;position:relative;width:100%">
                        <el-col :push="11" :span="6">
                            <el-button class="microphone-btn" v-if="turnonMicrophone" circle icon="el-icon-microphone" @click="clickturnDownMicrophone"></el-button>
                            <el-button class="microphone-btn" v-else circle icon="el-icon-turn-off-microphone" @click="clickturnOnMicrophone"></el-button>
                            <el-button v-if="turnonVideoCamera" circle icon="el-icon-video-camera" @click="clickturnDownVideoCamera"></el-button>
                            <el-button v-else circle @click="clickturnOnVideoCamera">
                                <img style="width:14px;height:12px;" src="/static/turnoffcamera.png">
                            </el-button>
                        </el-col>
                    </el-row>
                </el-dialog>
            </el-main>
        </el-container>
    </div>
</template>

<script>
export default {
    name: "index",
    data() {
        return {
            // setBackground: {
            //     backgroundImage: "url(" + require("/static/backgroud-2.png") + ")",
            //     backgroundRepeat: "no-repeat",
            //     align: 'center',
            //     width: '100%',
            //     height: '100%',
            //     position: 'absolute',
            //     padding: '0%',
            //     margin: '0%',
            //     'background-size':'100% 100%',
            //     '-moz-background-size':'100% 100%',
            //     'background-attachment': 'fixed'
            // },
            shadow: {
                'box-shadow': '0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)'
            },
            roomNumber: '',
            dialogVisible: false,
            turnonMicrophone: true,
            turnonVideoCamera: true,
            localStream: null,
            videoDevice: null,
            joinName: ''
        }
    },
    methods: {
        async _initMethod(){
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            this.videoDevice = videoDevices.length >0?videoDevices[0]:null;

            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: this.videoConf,
                audio: true,
            });


        },
        quickMeeting() {
            this.roomNumber = this.getNewRoom();
            this.showDialog();
            // this.jump(roomNumber)
        },
        joinMeeting() {
            this.showDialog();
        },
        goMeeting() {
            this.jump();
        },
        getNewRoom(){
           return Math.random().toFixed(6).slice(-6);
        },
        jump(){
            sessionStorage.setItem('joinName', this.joinName);
            sessionStorage.setItem('turnonVideoCamera', this.turnonVideoCamera);
            sessionStorage.setItem('turnonMicrophone', this.turnonMicrophone);
            this.$router.push('/meeting/'+ this.roomNumber);
        },
        showDialog(){
            this.dialogVisible = true;
            this.$nextTick(function() { 
                this.$refs.videoBackup.srcObject = this.localStream; 
            })
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
            console.log(audioTracks);
            if(audioTracks.length !==0){
                if(this.turnonMicrophone){
                    audioTracks[0].enabled = true;
                }else{
                    console.log('turn off audio')
                    audioTracks[0].enabled = false;
                }
            }
        },
        clickturnDownMicrophone(){
            this.turnonMicrophone = false;
            this.renderAudio();
        },
        clickturnOnMicrophone(){
            this.turnonMicrophone = true;
            this.renderAudio();
        },
        clickturnDownVideoCamera(){
            this.turnonVideoCamera = false;
            this.renderVideo();
        },
        clickturnOnVideoCamera(){
            this.turnonVideoCamera = true;
            this.renderVideo();
        }
    },
    mounted(){
        this._initMethod();
    },
    computed:{
        videoConf: function(){
            return  {
                deviceId: this.videoDevice.deviceId,
                width: 1920,
                height: 603
            };
        }
    }
}
</script>

<style scoped>
#main-background{
    background-image: url("/static/backgroud-2.png");
    background-repeat: no-repeat;
    align: center;
    width: 100%;
    height: 100%;
    position: absolute;
    padding: 0%;
    margin: 0%;
    background-size: 100% 100%;
    -moz-background-size: 100% 100%;
    background-attachment: fixed;
}

</style>