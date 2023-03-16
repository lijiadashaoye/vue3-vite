<template>
  <ul id="ul">
    <li
      :style="{ color: select === t ? 'red' : '' }"
      v-for="t in list"
      :key="t"
      @click="liClick(t)"
    >
      {{ t }}
    </li>
  </ul>
  <div class="m">
    <div class="can" ref="wap" style="width: 900px; height: 650px"></div>
    <div class="rightButtons">
      <ul>
        <li :id="t" v-for="t in types" :key="t">
          {{ t }}
        </li>
      </ul>
      <div v-if="select === 'm2'">
        <el-radio-group v-model="other.radio" class="ml-4">
          <el-radio label="1" size="large">THREE.AudioLoader</el-radio>
          <el-radio label="2" size="large">Audio</el-radio>
        </el-radio-group>
        <div class="volume" id="音量">
          <span>音量</span>
          <el-slider v-model="other.volume" :min="0" :max="1" :step="0.1" />
        </div>
      </div>
    </div>
  </div>
  <p style="width: 800px; text-align: center" ref="title"></p>
</template>

<script setup>
import { inject, onMounted, ref, getCurrentInstance, reactive } from "vue";
import { storeToRefs } from "pinia";

let select = ref(""),
  THREE = inject("THREE2"),
  wap = ref(null),
  title = ref(""),
  types = ref([]),
  other = reactive({ radio: "1", volume: 0.8 }),
  list = ref(["m1", "m2", "m3", "m4", "m5"]);

onMounted(() => {
  let show = sessionStorage.getItem("show2");
  let str = show ? show : list.value[0];
  liClick(str);
});
function liClick(str) {
  types.value = [];
  if (str === "m1") {
    types.value = ["开始", "结束", "暂停", "继续", "重置"];
  } else if (str === "m2") {
    types.value = ["开始", "结束", "暂停", "继续", "重置", "只有声音"];
  } else if (str === "m3") {
    types.value = ["开始"];
  } else if (str === "m4") {
    types.value = ["开始"];
  } else if (str === "m5") {
    types.value = ["开始"];
  }

  select.value = str;
  sessionStorage.setItem("show2", str);
  wap.value.innerHTML = "";

  import(`./js/six/${str}.js`).then((res) => {
    res.default(wap.value, THREE, title.value, other);
  });
}
</script>

<style scoped lang="scss">
.m {
  display: flex;
  & > p {
    display: flex;
    flex-direction: column;
    span {
      display: inline-block;
      margin-right: 5px;
      margin-bottom: 5px;
      font-size: 16px;
    }
  }
}
.can {
  position: relative;
  flex-shrink: 0;
  margin-right: 10px;
}
ul {
  list-style-type: none;
  display: flex;
  padding-left: 10px;
  li {
    padding: 2px 8px;
    font-size: 14px;
    margin-right: 5px;
    flex-shrink: 0;
    border: 1px solid rgb(205, 203, 203);
    border-radius: 3px;
    cursor: pointer;
  }
}
.volume {
  display: flex;
  align-items: center;
  & > span {
    display: inline-block;
    flex-shrink: 0;
    width: 40px;
    font-size: 12px;
    margin-right: 5px;
  }
}
</style>