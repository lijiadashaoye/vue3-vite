import webglUtils from '../../file/webgl-utils'
import m4 from '../../file/m4'

import img1 from '@/assets/neg-x.jpg'
import img2 from '@/assets/neg-y.jpg'
import img3 from '@/assets/neg-z.jpg'
import img4 from '@/assets/pos-x.jpg'
import img5 from '@/assets/pos-y.jpg'
import img6 from '@/assets/pos-z1.jpg'

export default function (can) {
    const gl = can.getContext('webgl'); // 获取webgl图形执行
    let width = can.clientWidth,
        height = can.clientHeight;
    gl.viewport(0, 0, width, height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    let vertexCode = `
           attribute vec4 a_position;
           varying vec4 v_position;
           void main() {
             v_position = a_position;
             gl_Position = vec4(a_position.xy, 1, 1);
           }`,
        fragCode = `
            precision mediump float;
    
            uniform samplerCube u_skybox;  // 立体纹理单元
            uniform mat4 u_viewDirectionProjectionInverse;
            
            varying vec4 v_position;
            void main() {
              vec4 t = u_viewDirectionProjectionInverse * v_position;
              // 除以 w 转换4D到3D
              gl_FragColor = textureCube(u_skybox, normalize(t.xyz / t.w));
            }`;
    var program = webglUtils.createProgramFromSources(gl, [vertexCode, fragCode]);
    gl.useProgram(program);

    var positionLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    var skyboxLocation = gl.getUniformLocation(program, "u_skybox");
    gl.uniform1i(skyboxLocation, 0);

    // 立方体纹理
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            url: img4,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: img1,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: img5,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: img2,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: img6,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: img3,
        },
    ];
    faceInfos.forEach((faceInfo) => {
        const { target, url } = faceInfo;
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 512;
        const height = 512;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
        const image = new Image();
        image.src = url;
        image.addEventListener('load', function () {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });
    });

    var fieldOfViewRadians = 60 * Math.PI / 180;
    var viewDirectionProjectionInverseLocation =
        gl.getUniformLocation(program, "u_viewDirectionProjectionInverse");
    var time = 0.01;
    function drawScene() {
        time += 0.02;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // 计算视图矩阵
        var aspect = width / height;
        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
        // 设置相机视图
        var cameraPosition = [Math.cos(time * .1), Math.sin(time * .1), Math.sin(time * .1)];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);
        // 相机矩阵逆矩阵，由相机矩阵得出视图矩阵。
        var viewMatrix = m4.inverse(cameraMatrix);
        // 只关心方向所以清除移动的部分
        viewMatrix[12] = 0;
        viewMatrix[13] = 0;
        viewMatrix[14] = 0;
        // 相机视角投影视图，由相机矩阵逆矩阵得出假定相机不动，物体移动的投影视图
        var viewDirectionProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
        // 相机视角投影视图逆矩阵
        // 反过来使用相机视角投影视图的逆，来获取由相机看向矩形每一个像素的方向，之前都是投影，也就是物体为起点指向相机
        var viewDirectionProjectionInverseMatrix = m4.inverse(viewDirectionProjectionMatrix);

        gl.uniformMatrix4fv(
            viewDirectionProjectionInverseLocation, false,
            viewDirectionProjectionInverseMatrix);
        // 如果传入值小于或等于深度缓冲区值，则通过
        // 让我们的四边形通过1.0的深度测试
        gl.depthFunc(gl.LEQUAL);
        gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);

        requestAnimationFrame(drawScene);
    }
    requestAnimationFrame(drawScene);
}

function setGeometry(gl) {
    var positions = new Float32Array(
        [
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}