<template>
  <div style="height: 33px">
    <button @click="routeChange('one')" class="navBtn">one</button>
    <button @click="routeChange('two')" class="navBtn">two</button>
    <button @click="routeChange('three')" class="navBtn">three</button>
    <el-button type="primary" @click="routeChange('four')">four</el-button>
    <Edit style="width: 1em; height: 1em; margin-right: 8px" />
  </div>

  <router-view></router-view>
  <!-- 路由缓存化 -->
  <!-- <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" :key="Component"></component>
    </keep-alive>
  </router-view> -->
</template>

<script setup>
import { provide, ref, computed } from "vue";
import { useRouter } from "vue-router";
let router = useRouter();
function routeChange(str) {
  if (str === "two") {
    router.push({
      name: str,
      query: { obj1: JSON.stringify({ kk: 3 }), str: "str" }, // 刷新不消失
      params: { obj2: 6, id: 5 }, // 只能用在东企鹅切换路由，params做参数用时
    });
  } else {
    router.push({ name: str });
  }
}
// 依赖注入 provide(name,value)
let forProvide = ref(11111);
provide("testProvide", forProvide);
</script>


<style>
button {
  margin-right: 10px;
}
</style>
