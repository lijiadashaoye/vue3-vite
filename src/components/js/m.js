import webglUtils from '../file/webgl-utils'
import m4 from '../file/m4'
import primitives from '../file/primitives'

import img1 from '@/assets/neg-x.jpg'
import img2 from '@/assets/neg-y.jpg'
import img3 from '@/assets/neg-z.jpg'
import img4 from '@/assets/pos-x.jpg'
import img5 from '@/assets/pos-y.jpg'
import img6 from '@/assets/pos-z.jpg'

export default function (can) {
    const gl = can.getContext('webgl'); // 获取webgl图形执行
    let width = can.clientWidth,
        height = can.clientHeight;
    gl.viewport(0, 0, width, height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
}