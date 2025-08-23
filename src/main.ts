import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from 'pinia'
import router from "./router/index";
import 'virtual:uno.css'
const pinia = createPinia()

createApp(App)
.use(router)
.use(pinia)
.mount("#app");
