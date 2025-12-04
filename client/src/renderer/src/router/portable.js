import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/index',
      component: () => import('@renderer/views/portable/index/Index.vue'),
    },
    {
      path: '/chat',
      component: () => import('@renderer/views/portable/chat/Chat.vue'),
    },
    {
      path: '/clipboard',
      component: () => import('@renderer/views/portable/clipboard/Clipboard.vue'),
    },
  ],
})

export default router
