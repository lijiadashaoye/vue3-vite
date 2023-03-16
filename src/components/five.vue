<template>
  <ul>
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
    <div class="can" ref="wap" style="width: 800px; height: 500px"></div>
    <div class="rightButtons">
      <ul>
        <li
          :style="{ color: type === t ? 'red' : '' }"
          @click="changeType(t)"
          v-for="t in types"
          :key="t"
        >
          {{ t }}
        </li>
      </ul>
    </div>
    <p>
      <span v-for="(t, i) in names" :key="t.name" :style="{ color: t.color }"
        >{{ i + 1 }}：{{ t.name }}</span
      >
    </p>
  </div>
  <p style="width: 800px; text-align: center" ref="title"></p>
</template>

<script setup>
import { inject, onMounted, ref, getCurrentInstance } from "vue";
import { storeToRefs } from "pinia";

let select = ref(""),
  THREE = inject("THREE2"),
  wap = ref(null),
  title = ref(""),
  list = ref([
    "m1",
    "m2",
    "m3",
    "m4",
    "m5",
    "m6",
    "m7",
    "m8",
    "m9",
    "m10",
    "m11",
    "m12",
    "m13",
    "m14",
    "m15",
    "m16",
  ]),
  fn = null,
  types = ref([]),
  type = ref(""),
  names = ref([]);

onMounted(() => {
  let show = sessionStorage.getItem("show1");
  if (show) {
    liClick(show);
  } else {
    liClick(list.value[0]);
  }
});
function liClick(str) {
  if (str !== "m3") {
    let statsDomElement = document.getElementById("statsDomElement");
    if (statsDomElement) {
      document.body.removeChild(statsDomElement);
    }
  }
  if (str !== "m4") {
    let gui = document.getElementById("gui");
    if (gui) {
      document.body.removeChild(gui);
    }
  }
  if (str === "m6") {
    types.value = [
      "Mesh",
      "Points",
      "Line",
      "LineLoop",
      "LineSegments",
      "Index",
    ];
    type.value = types.value[0];
  } else if (str === "m7") {
    types.value = ["矩形平面几何体", "长方体", "球体"];
    type.value = types.value[0];
  } else {
    types.value = [];
    type.value = "";
  }
  if (str === "m14") {
    names.value = [
      { name: "椭圆弧线 EllipseCurve", color: "blue" },
      { name: "圆弧线 ArcCurve", color: "#919102" },
      { name: "2D样条曲线 SplineCurve", color: "red" },
      { name: "3D样条曲线 CatmullRomCurve3", color: "green" },
      { name: "二维二次贝赛尔曲线 QuadraticBezierCurve", color: "#00ff27" },
      { name: "三维二次贝赛尔曲线 QuadraticBezierCurve3", color: "black" },
      { name: "二维三次贝赛尔曲线 CubicBezierCurve", color: "#ff6400" },
      { name: "三维三次贝赛尔曲线 CubicBezierCurve3", color: "#7629fc" },
    ];
  } else {
    names.value = [];
  }
  select.value = str;
  sessionStorage.setItem("show1", str);
  wap.value.innerHTML = "";

  import(`./js/five/${str}.js`).then((res) => {
    fn = res.default;
    fn(wap.value, THREE, title.value, type.value);
  });

  // const modules = import.meta.glob("./js/five/*.js");
  // let reg = new RegExp(str + ".js", "g");
  // Object.keys(modules).forEach((t) => {
  //   if (reg.test(t)) {
  //     modules[t]().then((res) => {
  //       fn = res.default;
  //       fn(wap.value, THREE, title.value, type.value);
  //     });
  //   }
  // });
}
function changeType(t) {
  type.value = t;
  fn(wap.value, THREE, title.value, type.value);
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
</style>