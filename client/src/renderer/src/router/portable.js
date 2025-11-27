import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/index' },
    { path: '/index', component: () => import('@renderer/views/portable/index/Index.vue') },
    { path: '/about', component: () => import('@renderer/views/portable/about/About.vue') },
  ],
})

export default router
