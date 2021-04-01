<template>
    <div class="chat-room">
        <div class="left">
            <p>
                <label for="username1">用户名：</label
                ><input v-model="username1" type="text" name="username1" />
            </p>
            <p>
                <label for="room1">房间号：</label
                ><input type="text" name="room1" v-model="roomId1" />
                <button @click="join">进入房间</button>
            </p>
            <p>
                <textarea name="roomMessage" cols="30" rows="10" v-model='roomMessage'></textarea>
            </p>
            <p>
                <label for="message1">输入信息：</label
                ><textarea
                    v-model="message1"
                    name="message1"
                    cols="30"
                    rows="10"
                ></textarea>
            </p>
            <p>
                <button @click="sendMessage">发送</button>
            </p>
        </div>
        <div class="right">
            <p>
                <label for="username2">用户名：</label
                ><input v-model="username2" type="text" name="username2" />
            </p>
            <p>
                <label for="room2">房间号：</label
                ><input type="text" name="room2" v-model="roomId2" />
                <button>进入房间</button>
            </p>
            <p>
                <label for="message2">输入信息</label
                ><textarea
                    v-model="message2"
                    name="message"
                    cols="30"
                    rows="10"
                ></textarea>
            </p>
            <p>
                <button>发送</button>
            </p>
        </div>

        
    </div>
</template>

<script>
export default {
    name: "ChatRoom",
    data() {
        return {
            message1: "",
            username1: "",
            roomId1: "",
            message2: "",
            username2: "",
            roomId2: "",
            socket: null,
            roomMessage: ''
        };
    },
    mounted() {
        this._initMethod();
    },
    methods: {
        _initMethod(){
            this.socket = this.$socketIoClient('http://localhost:3456');//这一步就connect 站点了
            this.socket.on('receive', (username, message) => {
                console.log(username, message);
                this.roomMessage += username +' 说: '+ message;
            })

            this.socket.on('joined', (roomId, message) => {
                console.log(message);
                console.log(roomId);
                this.roomMessage += message +' 加入了 '+ roomId;
            })
        },
        
        join(){
            console.log(this.roomId1, this.username1);
            this.socket.emit('join', this.roomId1, this.username1);
        },

        sendMessage(){
            this.socket.emit('message', this.roomId1, this.username1,this.message1);
        }
    }
};
</script>

<style scoped>
div.left {
    position: absolute;
    left: 5%;
    width: 35%;
    height: 50%;
    top: 10%;
    line-height: 40px;
}

div.right {
    position: absolute;
    right: 5%;
    width: 35%;
    height: 50%;
    top: 10%;
}


</style>
