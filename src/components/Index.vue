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
            roomNumber: ''
        }
    },
    methods: {
        quickMeeting() {
            let roomNumber = this.getNewRoom();
            this.jump(roomNumber)
        },
        joinMeeting() {
            this.jump(this.roomNumber)
        },
        getNewRoom(){
           return '123'
        },
        jump(roomNumber){
            this.$router.push('/meeting/'+ roomNumber)
        }
    },
    mounted(){

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