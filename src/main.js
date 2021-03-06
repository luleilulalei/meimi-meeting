// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import socketIoClient from 'socket.io-client'
import webrtcadapter from 'webrtc-adapter'
import Elementui from 'element-ui'
import { Message } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import less from 'less'

Vue.config.productionTip = false

Vue.prototype.$socketIoClient = socketIoClient
// Vue.prototype.$message = Message;
Vue.use(Elementui)
Vue.use(less)


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
