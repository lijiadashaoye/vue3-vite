<template>
  <lp-element num="88"></lp-element>
  <button @click="fn">直接变更state</button>
  <button @click="fn1">使用 actions，可以异步</button>
  <button @click="fn2">使用$patch，同步</button>
  <button @click="fn3">使用$patch，异步</button>
  <button @click="fn4">混合使用</button>
  <p>
    读取state： count：{{ store.count }}&nbsp;&nbsp;&nbsp; useStoreToRefs：{{
      useStoreToRefs.count
    }}
    &nbsp;&nbsp;&nbsp;使用getter：{{
      store.double
    }}
    &nbsp;&nbsp;&nbsp;使用getter：{{
      store.double1
    }}
    &nbsp;&nbsp;&nbsp;混合使用：{{ store.age }}
  </p>
</template>

<script setup>
import { getCurrentInstance, inject } from "vue";
import { storeToRefs } from "pinia";

let store = getCurrentInstance().proxy.pinia();
let pinia2 = inject("pinia2")();
// 解构获取state
let useStoreToRefs = storeToRefs(store);

function fn() {
  store.count++;
}
function fn1() {
  pinia2.increment();
}
function fn2() {
  store.$patch({
    count: ++store.count,
  });
}
function fn3() {
  store.$patch((state) => {
    setTimeout(() => {
      ++state.count;
    }, 2000);
  });
}
function fn4() {
  pinia2.mixStore();
}
// 订阅 state
// store.$subscribe((mutation, state) => {
//   console.log(mutation);
//   console.log(state);
// });
// 订阅 action
// store.$onAction((action) => {
//   console.log(action);
// });

// 范围内随机整数
function randomNumber(min, max) {
  if (min >= max) return max;
  // return Math.floor(Math.random() * (max - min) + min) // 不包含max
  return Math.floor(Math.random() * (max - min + 1) + min); // 包含max
}
// 不匹配开头
let result = "123456789".replace(/(?!^)(?=(\d{3})+$)/g, ",");
console.log(result);

let reg = /a/; // 存在g修饰符
console.log("abc".match(reg), reg.lastIndex);
console.log("abcag".match(reg), reg.lastIndex);
</script>

<style>
</style>