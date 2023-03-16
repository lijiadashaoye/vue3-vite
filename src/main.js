import {
    createApp
} from 'vue'
import App from './App.vue'
import axios from './axios'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import zhuCeCom from './components/zhuCeCom';
import './selfdefine/makeElement'; // 引入自定义webComponent

let app = createApp(App)
    .use(router)
    .use(store)
    .use(ElementPlus)
    .use(zhuCeCom);
// 可以同时创建多个app
// let app2 = createApp(App)
//     .use(router)
//     .use(store)
//     .use(ElementPlus)
//     .use(zhuCeCom);
// app2.mount('#app1')

// elementUI配置
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 使用pinia
import pinia from './pinia';
app.use(pinia.pinia)
app.config.globalProperties.pinia = pinia.store;// 全局挂载写法一
app.provide('pinia2', pinia.store) // 全局挂载写法二
// 使用asios
// app.config.globalProperties.axios1 = axios; // 全局挂载写法一
app.config.globalProperties.axios1 = axios; // 全局挂载写法一
app.provide('axios2', axios) // 全局挂载写法二

app.mount('#app')

// 使用自定义指令
import directives from './directive'
app.directive('makeFocus', directives.makeFocus)

import * as THREE from "three";
app.config.globalProperties.$THREE1 = THREE; // 全局挂载写法一
app.provide('THREE2', THREE) // 全局挂载写法二