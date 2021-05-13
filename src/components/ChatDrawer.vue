<template>
    <div class="chat-drawer">
        <el-drawer
        title="我是标题"
        :visible.sync="drawer_"
        :direction="direction"
        :show-close="false">
            <template v-slot:title>
                <span id="drawer-title">群聊</span>
            </template>

            <div class="chat-content">
                <!-- recordContent 聊天记录数组-->
                <div v-for="(itemc,indexc) in recordContent" :key="indexc">
                    <!-- 对方 -->
                    <div class="word" v-if="!itemc.mineMsg">
                        <!-- <img :src="itemc.headUrl"> -->
                        <div class="info">
                                <p class="time">{{itemc.nickName}}  {{itemc.timestamp}}</p>
                                <div class="info-content">{{itemc.contactText}}</div>
                        </div>
                    </div>
                    <!-- 我的 -->
                    <div class="word-my" v-else>
                        <div class="info">
                                <p class="time">{{itemc.nickName}}  {{itemc.timestamp}}</p>
                                <div class="info-content">{{itemc.contactText}}</div>
                        </div>
                        <!-- <img :src="itemc.headUrl"> -->
                    </div>
                </div>
                <div></div>
            </div>
            <div class="input-content" style="margin-top:1.5px">
                <el-input style="width:77%" class="input-box" v-model="inputContent"></el-input>
                <el-button type="primary" size="mini" style="width:20%" @click="sendMessage">发送</el-button>
            </div>
        </el-drawer>
    </div>
</template>

<script>
export default {
    name: "ChatDrawer",
    props: {
        drawer: {
            type: Boolean,
            default: false
        },
        recordContent: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            direction: 'ltr',
            inputContent: '',
            recordContent: [ {
                    nickName: 'qjk',
                    timestamp: '',
                    contactText: 'ehheejlkda',
                    mineMsg: true
                },{
                    nickName: 'qjk',
                    timestamp: '',
                    contactText: 'ehheejlkda',
                    mineMsg: true
                },
            ]
        };
    },
    computed: {
        drawer_: {
            set(v){
                this.$emit("change-drawer", v);
            },
            get(){
                return this.drawer
            }
        }
    },
    mounted() {
        this._initMethod();
    },
    methods: {
        _initMethod(){},
        sendMessage(){
            this.$emit('say', this.inputContent);
        }
    }
};
</script>

<style scoped lang="less">

/deep/ header#el-drawer__title {
    background-color: #242424;
    margin-bottom: 0;
    padding: 10px 10px;
}

/deep/ section.el-drawer__body {
    background-color: #330033;
    height: 100%;
}

// .el-drawer__body {
//     -webkit-box-flex: 1;
//     -ms-flex: 1;
//     flex: 1;
//     height: 100%;
// }

/*修改滚动条样式*/
div::-webkit-scrollbar{
  width:3px;
  height:10px;
  /**/
}
div::-webkit-scrollbar:hover{
  width:8px;
  height:10px;
  /**/
}
div::-webkit-scrollbar-track{
  background: rgb(239, 239, 239);
  border-radius:2px;
}
div::-webkit-scrollbar-thumb{
  background: #bfbfbf;
  border-radius:10px;
}
div::-webkit-scrollbar-thumb:hover{
  background: #333;
}
div::-webkit-scrollbar-corner{
  background: #179a16;
}


.chat-content{
  width: 100%;
  padding: 20px;
  max-height: 88%;
  height: 88%;
  overflow :auto;
  .word{
     display: flex;
     margin-bottom: 20px;
     img{
       width: 40px;
       height: 40px;
       border-radius: 50%;
     }
     .info{
       margin-left: 10px;
       .time{
         font-size: 12px;
         color: #DDDDDD;
         margin: 0;
         height: 20px;
         line-height: 20px;
         margin-top: -5px;
       }
       .info-content{
          padding: 10px;
          font-size: 14px;
          background: #DDDDDD;
          position: relative;
          margin-top: 8px;
        }
        //小三角形
        .info-content::before{
            position: absolute;
            left: -8px;
            top: 8px;
            content: '';
            border-right: 10px solid #DDDDDD;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
        }
     }
  }
 
.word-my{
    display: flex;
    justify-content:flex-end;
    margin-bottom: 20px;
    img{
       width: 40px;
       height: 40px;
       border-radius: 50%;
     }
     .info{
       width: 90%;
       margin-left: 10px;
       text-align: right;
       .time{
         font-size: 12px;
         color: #DDDDDD;
         margin: 0;
         height: 20px;
         line-height: 20px;
         margin-top: -5px;
         margin-right: 10px;
       }
       .info-content{
          max-width: 70%;
          padding: 10px;
          font-size: 14px;
          float: right;
          margin-right: 10px;
          position: relative;
          margin-top: 8px;
          background: #CC66CC; //#A3C3F6 
          text-align: left;
        }
        //小三角形
        .info-content::after{
            position: absolute;
            right: -8px;
            top: 8px;
            content: '';
            border-left: 10px solid #CC66CC;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
        }
     }
  }
}

#drawer-title {
    color: #fff;
    text-align: center;
}

.input-content{
    // position: absolute;
    // padding: 5px;
    height: 15%;
    bottom: 10px;
    width: 100%;
    border-width: 1px;
    border: #242424;
}
</style>
