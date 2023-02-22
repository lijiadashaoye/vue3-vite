<template>
  <div>
    <h4>父组件给子组件的props：{{ msg }}</h4>
    <button @click="emitFn">emitFn</button>
    <hr />
    <slot> </slot>
    <p v-bind="$attrs">子组件正常显示内容</p>
    <slot name="slotName" :slotData="slotData"></slot>
  </div>
</template>
<script>
// 不使用setup的写法
import { defineComponent } from "vue";
export default defineComponent({
  created() {},
});
</script>

<script setup>
import { reactive, ref } from "vue";
// defineExpose 用来定义当前组件暴露出去的属性或方法
let childData = ref("暴露的子组件属性");
function childFn() {
  childData.value = `暴露的子组件属性--${Math.trunc(Math.random() * 100)}`;
}
defineExpose({
  childFn,
  childData,
});
// defineProps用来获取组件传值 props
let props = defineProps({
  msg: String,
});
console.log(props.msg);
// defineEmits用来定义哪些函数是emit事件
const emits = defineEmits(["self"]);
function emitFn() {
  emits("self", { emitData: Math.trunc(Math.random() * 100) });
}
let slotData = reactive({ age: "具名插槽" });
</script>

<style scoped>
@media (min-width: 500px) {
  h4 {
    color: red;
  }
}
</style>
