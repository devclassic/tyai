import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@renderer/views/portable/index/Index.vue'),
    },
    {
      path: '/clipboard',
      component: () => import('@renderer/views/portable/clipboard/Clipboard.vue'),
    },
    {
      path: '/about',
      component: () => import('@renderer/views/portable/about/About.vue'),
    },
  ],
})

export default router
