<template>
  <div>
    <ul>
      <li
        v-for="(gl, i) in glList"
        :key="i"
        @click="showIt(gl)"
        :style="{ color: show === gl ? 'red' : '' }"
      >
        {{ gl }}
      </li>
    </ul>
    <div class="wap" v-if="show === 'm1'">
      <canvas ref="can1" class="can" width="550" height="350"></canvas>
      <p>两点画平面三角形</p>
    </div>
    <div class="wap" v-if="show === 'm2'">
      <canvas ref="can2" class="can" width="550" height="350"></canvas>
      <p>三点画三维空间里的三角形</p>
    </div>
    <div class="wap" v-if="show === 'm3'">
      <canvas ref="can3" class="can" width="550" height="350"></canvas>
      <p>使用索引画三维空间的三角形</p>
    </div>
    <div class="m4" v-if="show === 'm4'">
      <div>
        <div>
          <canvas ref="can4" class="can" width="550" height="350"></canvas>
          <p>drawArrays第一个参数</p>
        </div>
        <div>
          <ul>
            <li v-for="(t, i) in typeList" :key="i" @click="showType(t)">
              {{ t }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="wap" v-if="show === 'm5'">
      <canvas ref="can5" class="can" width="550" height="350"></canvas>
      <p>使用索引画矩形</p>
    </div>
    <div class="wap" v-if="show === 'm6'">
      <canvas ref="can6" class="can" width="550" height="350"></canvas>
      <p>使用索引画随机颜色的矩形</p>
    </div>
    <div class="wap" v-if="show === 'm7'">
      <canvas ref="can7" class="can" width="550" height="350"></canvas>
      <p>二维移动</p>
    </div>
    <div class="wap" v-if="show === 'm8'">
      <canvas ref="can8" class="can" width="550" height="350"></canvas>
      <p>二维缩放</p>
    </div>
    <div class="wap" v-if="show === 'm9'">
      <canvas ref="can9" class="can" width="550" height="350"></canvas>
      <p>二维旋转</p>
    </div>
    <div class="wap" v-if="show === 'm10'">
      <canvas ref="can10" class="can" width="550" height="350"></canvas>
      <p>三维旋转</p>
    </div>
    <div class="wap" v-if="show === 'm11'">
      <canvas ref="can11" class="can" width="550" height="350"></canvas>
      <p>鼠标操作旋转</p>
    </div>
    <div class="wap" v-if="show === 'm12'">
      <canvas ref="can12" class="can" width="550" height="350"></canvas>
      <p>纹理</p>
      <div>
        <button id="fn1">多图片重合</button>
        <button id="fn2">图片边缘处理</button>
        <button id="fn3">正常覆盖</button>
      </div>
    </div>
    <div class="wap" v-if="show === 'm13'">
      <canvas ref="can13" class="can" width="550" height="350"></canvas>
      <p>图片处理（模糊）</p>
    </div>
    <div class="wap" v-if="show === 'm14'">
      <canvas ref="can14" class="can" width="550" height="350"></canvas>
      <p>随机生成</p>
    </div>
    <div class="m15" v-if="show === 'm15'">
      <div>
        <div>
          <canvas ref="can15" class="can" width="550" height="350"></canvas>
          <p>二维平面变换</p>
        </div>
        <div>
          <div class="text">
            <span>x:</span>
            <input
              type="range"
              step="1"
              id="xx15"
              value="0"
              min="0"
              max="200"
            />
            <span id="xxS15">0</span>
          </div>
          <div class="text">
            <span>y:</span>
            <input
              type="range"
              id="yy15"
              step="1"
              value="0"
              min="0"
              max="120"
            />
            <span id="yyS15">0</span>
          </div>
          <div class="text">
            <span>旋转:</span>
            <input
              type="range"
              step="0.1"
              id="rr15"
              value="0"
              min="-360"
              max="360"
            />
            <span id="rS15">0</span>
            <span>°</span>
          </div>
          <div class="text">
            <span>x缩放:</span>
            <input
              type="range"
              id="ttx15"
              step="0.1"
              value="1"
              min="0"
              max="2"
            />
            <span id="tSx15">0</span>
          </div>
          <div class="text">
            <span>y缩放:</span>
            <input
              type="range"
              id="tty15"
              step="0.1"
              value="1"
              min="0"
              max="2"
            />
            <span id="tSy15">0</span>
          </div>
        </div>
      </div>
    </div>
    <div class="wap" v-if="show === 'm16'">
      <canvas ref="can16" class="can" width="550" height="350"></canvas>
      <p>gl.POINTS 使用</p>
    </div>
    <div class="m17" v-if="show === 'm17'">
      <div>
        <div>
          <canvas ref="can17" class="can" width="550" height="350"></canvas>
          <p>三维旋转</p>
        </div>
        <div>
          <div>
            <div class="text">
              <span>x:</span>
              <input
                type="range"
                id="tx"
                step="1"
                value="0"
                min="-250"
                max="250"
              />
              <span id="txs">0</span>
            </div>
            <div class="text">
              <span>y:</span>
              <input
                type="range"
                id="ty"
                step="1"
                value="0"
                min="-150"
                max="150"
              />
              <span id="tys">0</span>
            </div>
            <div class="text">
              <span>z:</span>
              <input
                type="range"
                id="tz"
                step="1"
                value="0"
                min="-2000"
                max="0"
              />
              <span id="tzs">0</span>
            </div>
            <div class="text">
              <span>绕X轴旋转:</span>
              <input
                type="range"
                step="0.1"
                id="rx"
                value="0"
                min="0"
                max="360"
              />
              <span id="rxs">0</span>
              <span>°</span>
            </div>
            <div class="text">
              <span>绕Y轴旋转:</span>
              <input
                type="range"
                id="ry"
                step="0.1"
                value="0"
                min="0"
                max="360"
              />
              <span id="rys">0</span>
              <span>°</span>
            </div>
            <div class="text">
              <span>绕Z轴旋转:</span>
              <input
                type="range"
                id="rz"
                step="0.1"
                value="0"
                min="0"
                max="360"
              />
              <span id="rzs">0</span>
              <span>°</span>
            </div>
            <div class="text">
              <span>x轴缩放:</span>
              <input
                type="range"
                step="0.1"
                id="sx"
                value="0"
                min="0"
                max="5"
              />
              <span id="sxs">0</span>
            </div>
            <div class="text">
              <span>y轴缩放:</span>
              <input
                type="range"
                id="sy"
                step="0.1"
                value="0"
                min="0"
                max="5"
              />
              <span id="sys">0</span>
            </div>
            <div class="text">
              <span>z轴缩放:</span>
              <input
                type="range"
                id="sz"
                step="0.1"
                value="0"
                min="0"
                max="50"
              />
              <span id="szs">0</span>
            </div>
            <div class="text">
              <span>视锥角度度:</span>
              <input
                type="range"
                id="sf"
                step="1"
                value="0"
                min="1"
                max="179"
              />
              <span id="sfs">0</span>
              <span>°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="m18" v-if="show === 'm18'">
      <div>
        <div>
          <canvas ref="can18" class="can" width="550" height="350"></canvas>
          <p>摄像机</p>
        </div>
        <div>
          <div class="text">
            <span>盯着一个看:</span>
            <el-checkbox id="see" style="margin: 0 4px"></el-checkbox>
          </div>
          <div class="text">
            <span>cameraAngle:</span>
            <input
              type="range"
              step="1"
              id="cameraAngle"
              value="0"
              min="0"
              max="360"
            />
            <span id="cameraAngles">0</span>
          </div>
        </div>
      </div>
    </div>
    <div class="m19" v-if="show === 'm19'">
      <div>
        <div>
          <canvas ref="can19" class="can" width="550" height="350"></canvas>
          <p>平行光+雾化</p>
        </div>
        <div>
          <div class="text">
            <span>y轴旋转:</span>
            <input
              type="range"
              step="1"
              id="yRotate"
              value="0"
              min="-360"
              max="360"
            />
            <span id="yRotates">0</span>
          </div>
          <div class="text">
            <span>z轴移动:</span>
            <input
              type="range"
              step="0.1"
              id="zTranslate"
              value="0"
              min="-800"
              max="150"
            />
            <span id="zTranslates">0</span>
          </div>
          <div class="text">
            <span>雾的近面:</span>
            <input
              type="range"
              step="0.1"
              id="nearFace"
              value="10"
              min="0"
              max="800"
            />
            <span id="nearFaces">10</span>
          </div>
          <div class="text">
            <span>雾的远面:</span>
            <input
              type="range"
              step="0.1"
              id="farFace"
              value="600"
              min="0"
              max="1000"
            />
            <span id="farFaces">600</span>
          </div>
        </div>
      </div>
    </div>
    <div class="m20" v-if="show === 'm20'">
      <div>
        <div>
          <canvas ref="can20" class="can" width="550" height="350"></canvas>
          <p>点光源</p>
        </div>
        <div>
          <div class="text">
            <span>y轴旋转:</span>
            <input
              type="range"
              step="1"
              id="yRotate"
              value="0"
              min="0"
              max="360"
            />
            <span id="yRotates">0</span>
          </div>
          <div class="text">
            <span>光的距离:</span>
            <input
              type="range"
              step="1"
              id="light"
              value="200"
              min="0"
              max="200"
            />
            <span id="lights">200</span>
          </div>
          <div class="text">
            <span>光的颜色:</span>
            <input type="color" id="ligthColor" />
            <span id="ligthColors">0</span>
          </div>
          <div class="text">
            <span>透明度:</span>
            <el-checkbox id="tmd" style="margin: 0 2px"></el-checkbox>
            <input
              type="range"
              step="0.01"
              id="AlphaStep"
              value="1"
              min="0"
              max="1"
            />
            <span id="AlphaSteps">1</span>
          </div>
          <div class="text">
            <button id="jieping">截屏</button>
          </div>
        </div>
      </div>
    </div>
    <div class="m21" v-if="show === 'm21'">
      <div>
        <div>
          <canvas ref="can21" class="can" width="550" height="350"></canvas>
          <p>聚光灯</p>
        </div>
        <div>
          <div class="text">
            <span>y轴旋转:</span>
            <input
              type="range"
              step="1"
              id="yRotate"
              value="0"
              min="0"
              max="360"
            />
            <span id="yRotates">0</span>
          </div>
          <div class="text">
            <span>光的距离:</span>
            <input
              type="range"
              step="1"
              id="light"
              value="0"
              min="0"
              max="200"
            />
            <span id="lights">0</span>
          </div>
          <div class="text">
            <span>光的颜色:</span>
            <input type="color" id="ligthColor" />
            <span id="ligthColors">0</span>
          </div>
          <div class="text">
            <span>y移动:</span>
            <input
              type="range"
              step="0.001"
              id="xMove"
              value="0"
              min="-2"
              max="2"
            />
            <span id="xMoves">0</span>
          </div>
          <div class="text">
            <span>x移动:</span>
            <input
              type="range"
              step="0.001"
              id="yMove"
              value="0"
              min="-2"
              max="2"
            />
            <span id="yMoves">0</span>
          </div>
          <div class="text">
            <span>高光范围:</span>
            <input
              type="range"
              step="0.01"
              id="innerLimit"
              value="10"
              min="0"
              max="50"
            />
            <span id="innerLimits">10</span>
          </div>
          <div class="text">
            <span>光晕范围:</span>
            <input
              type="range"
              step="0.01"
              id="outerLimit"
              value="50"
              min="1"
              max="50"
            />
            <span id="outerLimits">50</span>
          </div>
        </div>
      </div>
    </div>
    <div class="m22" v-if="show === 'm22'">
      <div>
        <div>
          <canvas ref="can22" class="can" width="550" height="350"></canvas>
          <p>使用浓度设置雾化</p>
        </div>
        <div>
          <div class="text">
            <span>雾的浓度:</span>
            <input
              type="range"
              step="0.01"
              id="nd1"
              value="0"
              min="0"
              max="1"
            />
            <span id="nd1s">0</span>
          </div>
        </div>
      </div>
    </div>
    <div class="wap" v-if="show === 'm23'">
      <canvas ref="can23" class="can" width="550" height="350"></canvas>
      <p>投影视图+纹理模板</p>
    </div>
    <div class="wap" v-if="show === 'm24'">
      <canvas ref="can24" class="can" width="550" height="350"></canvas>
      <p>帧缓冲（framebuffer）使用</p>
    </div>
    <div class="m25" v-if="show === 'm25'">
      <div>
        <div>
          <canvas ref="can25" class="can" width="550" height="350"></canvas>
          <p>贴图 + 多个program共存</p>
        </div>
      </div>
    </div>
    <div class="m26" v-if="show === 'm26'">
      <div>
        <div>
          <canvas ref="can26" class="can" width="550" height="350"></canvas>
          <p>投影视图+纹理模板</p>
        </div>
        <div>
          <div class="text">
            <span>cameraX:</span>
            <input
              type="range"
              step="0.01"
              id="cameraX"
              value="2"
              min="-10"
              max="10"
            />
            <span id="cameraXs">2</span>
          </div>
          <div class="text">
            <span>cameraY:</span>
            <input
              type="range"
              step="0.01"
              id="cameraY"
              value="5"
              min="1"
              max="10"
            />
            <span id="cameraYs">5</span>
          </div>
        </div>
      </div>
    </div>
    <div class="wap" v-if="show === 'm27'">
      <canvas ref="can27" class="can" width="550" height="350"></canvas>
      <p>立方体贴图</p>
    </div>
    <div class="wap" v-if="show === 'm28'">
      <canvas ref="can28" class="can" width="550" height="350"></canvas>
      <p>天空盒</p>
    </div>
    <div class="wap" v-if="show === 'm29'">
      <canvas ref="can29" class="can" width="550" height="350"></canvas>
      <p>综合运用</p>
    </div>
    <div class="wap" v-if="show === 'm30'">
      <canvas ref="can30" class="can" width="550" height="350"></canvas>
      <p>使用片元着色器传数据</p>
    </div>
    <div class="wap" v-if="show === 'm31'">
      <canvas ref="can31" class="can" width="550" height="350"></canvas>
      <p>SCISSOR_TEST 使用</p>
    </div>
    <div class="wap" v-if="show === 'm32'">
      <canvas ref="can32" class="can" width="550" height="350"></canvas>
      <p>使用图片表达文字</p>
    </div>
    <div class="wap" v-if="show === 'm33'">
      <canvas ref="can33" class="can" width="550" height="350"></canvas>
      <p>双摄像机</p>
    </div>
    <div class="wap" v-if="show === 'm34'">
      <canvas ref="can34" class="can" width="550" height="350"></canvas>
      <p>同时绘制多个物体的基础格式</p>
    </div>
    <div class="wap" v-if="show === 'm35'">
      <canvas ref="can35" class="can" width="550" height="350"></canvas>
      <p>场景图</p>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      show: "",
      glList: [
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
        "m17",
        "m18",
        "m19",
        "m20",
        "m21",
        "m22",
        "m23",
        "m24",
        "m25",
        "m26",
        "m27",
        "m28",
        "m29",
        "m30",
        "m31",
        "m32",
        "m33",
        "m34",
        "m35",
      ],
      typeList: [
        "LINES",
        "LINE_STRIP",
        "LINE_LOOP",
        "TRIANGLE_STRIP",
        "TRIANGLES",
        "TRIANGLE_FAN",
      ],
    };
  },
  mounted() {
    let show = sessionStorage.getItem("show");
    if (show) {
      this.showIt(show, this.typeList[0]);
    }
  },
  methods: {
    showIt(tar, type) {
      let str = tar.slice(1);
      this.show = tar;
      sessionStorage.setItem("show", tar);
      import(`./js/three/${tar}.js`).then((res) => {
        let target = this.$refs[`can${str}`];
        res.default(target, type ? type : this.typeList[0]);
      });
    },
    showType(type) {
      let show = sessionStorage.getItem("show");
      this.showIt(show, type);
    },
  },
};
</script>


<style scoped lang="scss">
ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  & > li {
    padding: 0 8px;
    border: 1px solid rgb(216, 214, 214);
    border-radius: 5px;
    cursor: pointer;
    margin-right: 8px;
    margin-bottom: 6px;
  }
}
.can {
  border: 1px solid rgb(226, 226, 226);
  position: relative;
}
.wap {
  display: inline-block;
}
p {
  font-size: 12px;
  text-align: center;
  margin: 0;
}
.m {
  display: flex;
  canvas {
    flex-shrink: 0;
  }
  .text {
    margin-left: 10px;
    display: flex;
    align-items: center;
    input {
      margin: 3px;
    }
    span {
      font-size: 14px;
    }
  }
}
.m15,
.m20,
.m19,
.m18,
.m17,
.m21,
.m22,
.m25,
.m26,
.m27,
.m28,
.m29,
.m4 {
  display: inline-block;
  vertical-align: top;
  & > div {
    display: flex;
    & > div {
      display: inline-block;
      & > div:nth-child(2) {
        width: 300px;
      }
    }
    canvas {
      flex-shrink: 0;
    }
    .text {
      margin-left: 10px;
      display: flex;
      align-items: center;
      input {
        margin: 3px;
      }
      span {
        font-size: 14px;
      }
    }
  }
}
.m4 ul {
  font-size: 12px;
  width: 150px;
  display: flex;
  flex-direction: column;
  li {
    border: none;
    margin-bottom: 10px;
    &:hover {
      color: red;
    }
  }
}
</style>