import './assets/css/global.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/portable'
import App from './views/portable/App.vue'

const pinia = createPinia()

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
