import { defineCustomElement } from "vue";
import one from './one.ce.vue'; // 文件需要以 .ce.vue 结尾才能将组件内的样式也正确的引用上

export default (function () {
    const lpelement = defineCustomElement(one);
    customElements.define("lp-element", lpelement);
})()