<template>
  <div ref="wap">
    <one-child ref="child" msg="Vite + Vue" @self="childEmit">
      <template #default>
        <span>默认插槽写法二，也可只用#替代#default</span>
      </template>
      <!-- <span>默认插槽写法一</span> -->
      <template #[dtSlotName]="pp">
        <span>使用变量插槽名：{{ pp.slotData.age }}</span>
      </template>
    </one-child>
    <p class="forEmit">
      emitData：<span>{{ getEmitData }}</span>
    </p>
    <hr />
    <button @click="changeNum">num：{{ num }}</button>
    <button @click="changeObjOne">obj.job.one：{{ obj.job.one }}</button>
    <button @click="changeObjOneAge">
      obj.job.one和age：{{ obj.age }}--{{ obj.job.one }}
    </button>
    <hr />
    <p>{{ child.childData }}</p>
    <button @click="child.childFn">调用子组件方法</button>
    <hr />
    <h4>computed 使用</h4>
    <el-input
      v-makeFocus
      style="width: 100px"
      v-model="isMath.one"
      placeholder="Please input"
    />
    +
    <el-input
      style="width: 100px"
      v-model="isMath.two"
      placeholder="Please input"
    />
    = {{ isMath.three }}
    <hr />
    <h4>自定义v-model</h4>
    <Vmodel1 v-model="forChild1" />
    <Vmodel2 v-model="forChild2" />
    <hr />
    <h4>标签式使用自定义组件</h4>
    <makeCom :text="makeComText" @close="close" />
    <hr />
    <h4>css样式的写法</h4>
    <p :class="[{ useArray: true }, 'useClass']">:class 使用数组</p>
    <p :class="{ useClass: true }">:class 使用对象</p>
    <p :style="[{ 'font-weight': 'bold' }]">:style 使用数组</p>
    <p :style="{ 'font-weight': 'bold' }">:style 使用对象</p>

    <p>v-if 比 v-for 优先级高</p>
    <p>prop 在子组件中是只读的</p>
  </div>
</template>
<script setup>
import {
  ref,
  reactive,
  defineAsyncComponent,
  onMounted,
  watch,
  computed,
} from "vue";
import Vmodel1 from "./v_model1.vue";
import Vmodel2 from "./v_model2.vue";
// 变量插槽名
let dtSlotName = ref("slotName");

// 异步加载组件
let oneChild = defineAsyncComponent(() => import("./oneChild.vue"));

// watch监听
// 监听基本数据
let num = ref(0);
function changeNum() {
  num.value++;
}
watch(
  num, // 指定ref()定义的值，不需要加value，但读取值时，需要加
  () => {
    console.log(num.value);
  },
  { immediate: true }
);
// 监听对象数据
let obj = reactive({
  age: 1,
  job: {
    one: 7,
  },
});
function changeObjOne() {
  obj.job.one++;
}
function changeObjOneAge() {
  obj.age++;
  obj.job.one++;
}
// 只要obj里任何属性发生变化，都会执行
// watch(obj, () => {
//   console.log(obj.age);
// });
// 指定监听，只有这个属性值发生变动才会执行
watch(
  () => obj.job.one,
  () => {
    console.log(obj.job.one);
  }
);
// 以数组形式指定监听多个属性
watch([() => obj.age, () => obj.job.one], (t) => {
  console.log(t);
});
// 监听子组件emit
let getEmitData = ref(null);
function childEmit(val) {
  getEmitData.value = val.emitData;
}
// 获取dom
// let wap = ref(null);
// onMounted(() => {
//   console.log(wap.value);
// });
// 父组件调用子组件的方法
let child = ref("");
let isMath = reactive({
  one: "",
  two: "",
  // 计算属性默认是只读的，避免直接修改计算属性值
  three: computed({
    // 第一种写法：用对象
    get() {
      let kk = ref("结果：");
      if (isMath.one !== "" && isMath.two !== "") {
        return kk.value + +isMath.one + +isMath.two;
      }
    },
  }),
  // 第二种写法：用箭头函数
  // three: computed(() => {
  //   if (isMath.one !== "" && isMath.two !== "") {
  //     return +isMath.one + +isMath.two;
  //   }
  // }),
});
let forChild1 = ref("forChild1"),
  forChild2 = ref("forChild2");

let makeComText = ref("自定义组件");
function close(t) {
  makeComText.value = t;
}

// 使用webWorker
// 方式一
// import MyWorker from "./Worker?worker";
// let worke = new MyWorker();
// 方式二
// import.meta.url 是一个 ESM 的原生功能，会暴露当前模块的 URL。URL 第一个参数字符串必须是静态的
let worke = new Worker(new URL("./Worker.js", import.meta.url));
worke.onmessage = (msg) => {
  console.log(msg);
  console.log(import.meta);
};
worke.postMessage("2222");
</script>
<style scoped lang='scss'>
h4 {
  margin: 8px 0;
}
button {
  margin-right: 10px;
}

.forEmit {
  span: {
    color: blue;
  }
}
.useClass {
  color: red;
}
.useArray {
  font-size: 16px;
}
</style>
