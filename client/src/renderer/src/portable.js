import '@renderer/assets/css/portable.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from '@renderer/router/portable'
import App from '@renderer/views/portable/App.vue'

const pinia = createPinia()

const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')
