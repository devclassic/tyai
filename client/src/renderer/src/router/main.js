import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/knowledge' },
    { path: '/knowledge', component: () => import('../views/main/knowledge/Knowledge.vue') },
    { path: '/speech', component: () => import('../views/main/speech/Speech.vue') },
    { path: '/form', component: () => import('../views/main/form/Form.vue') },
    { path: '/doc', component: () => import('../views/main/doc/Doc.vue') },
    { path: '/ocr', component: () => import('../views/main/ocr/Ocr.vue') },
    { path: '/docs', component: () => import('../views/main/docs/Docs.vue') },
  ],
})

router.beforeEach((to, from, next) => {
  speechSynthesis.cancel()
  return next()
})

export default router
