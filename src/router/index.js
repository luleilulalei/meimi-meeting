import Vue from 'vue'
import Router from 'vue-router'
// import HelloWorld from '@/components/HelloWorld'
// import ChatRoom from '@/components/ChatRoom'
import Meeting from '@/components/Meeting'
import Index from '@/components/Index'


Vue.use(Router)

export default new Router({
  // base: 'meeting',
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/meeting/:roomId',
      name: 'Meeting',
      component: Meeting
    }
  ]
})
