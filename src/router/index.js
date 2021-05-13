import Vue from 'vue'
import Router from 'vue-router'
import Meeting from '@/components/Meeting'
import WhiteBoard from '@/components/WhiteBoard'
import Index from '@/components/Index'
import ChatDrawer from '@/components/ChatDrawer'


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
    },
    {
      path: '/white-board',
      name: 'WhiteBoard',
      component: WhiteBoard
    },
    {
      path: '/chat-drawer',
      name: 'ChatDrawer',
      component: ChatDrawer
    }
  ]
})
