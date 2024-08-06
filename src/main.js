import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

console.log('Main.js: Creating Vue app')
const app = createApp(App)
console.log('Main.js: Using router')
app.use(router)
console.log('Main.js: Mounting app')
app.mount('#app')