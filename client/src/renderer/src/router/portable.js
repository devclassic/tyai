import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/index',
      component: () => import('@renderer/views/portable/index/Index.vue'),
    },
    {
      path: '/about',
      component: () => import('@renderer/views/portable/about/About.vue'),
    },
    {
      path: '/clipboard',
      component: () => import('@renderer/views/portable/clipboard/Clipboard.vue'),
    },
  ],
})

export default router
