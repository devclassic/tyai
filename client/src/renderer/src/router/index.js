import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('../views/index/Index.vue') },
    { path: '/knowledge', component: () => import('../views/knowledge/Knowledge.vue') },
    { path: '/speech', component: () => import('../views/speech/Speech.vue') },
    { path: '/form', component: () => import('../views/form/Form.vue') },
    { path: '/doc', component: () => import('../views/doc/Doc.vue') },
    { path: '/ocr', component: () => import('../views/ocr/Ocr.vue') },
    { path: '/docs', component: () => import('../views/docs/Docs.vue') },
  ],
})

export default router
