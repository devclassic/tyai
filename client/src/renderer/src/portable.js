import '@renderer/assets/css/portable.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@renderer/router/portable'
import App from '@renderer/views/portable/App.vue'

const pinia = createPinia()

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
