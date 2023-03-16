import webglUtils from '../../file/webgl-utils'
import m4 from '../../file/m4'
import primitives from '../../file/primitives'

export default function (can) {
    const gl = can.getContext('webgl'); // 获取webgl图形执行
    let width = can.clientWidth,
        height = can.clientHeight;
    gl.viewport(0, 0, width, height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
}