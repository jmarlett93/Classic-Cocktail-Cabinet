import 'bootstrap';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; //shouldnt this be router/index.js since index is the actual file?

createApp(App).use(router).mount('#app');
