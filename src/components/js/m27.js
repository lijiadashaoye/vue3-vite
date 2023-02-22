import webglUtils from '../file/webgl-utils'
import m4 from '../file/m4'

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

    let vertexCode = `
        attribute vec4 a_position;
        attribute vec3 a_normal;
        
        uniform mat4 u_projection; // 投影视图矩阵
        uniform mat4 u_view; // 相机视图的逆矩阵
        uniform mat4 u_world; // 物体的变化矩阵
        
        varying vec3 v_worldPosition;
        varying vec3 v_worldNormal;
        
        void main() {
          gl_Position = u_projection * u_view * u_world * a_position;
          v_worldPosition = (u_world * a_position).xyz;
          v_worldNormal = mat3(u_world) * a_normal;
        }`,
        fragCode = `
        precision highp float;
        varying vec3 v_worldPosition; // 物体的世界坐标矩阵
        varying vec3 v_worldNormal; // 法向量矩阵
        uniform samplerCube u_texture; // 立体纹理单元
        uniform vec3 u_worldCameraPosition; // 相机的世界坐标矩阵
        
        void main() {
          // 单位化法向量
          vec3 worldNormal = normalize(v_worldNormal);
          // 计算相机指向表面的向量，向量是由 终点B - 起点A，方向为由A指向B；
          vec3 eyeToSurfaceDir = normalize(v_worldPosition - u_worldCameraPosition); 
          // 计算反射，获取纹理数据
          // reflect(相机指向表面的向量，法向量)，计算反射光线，无所谓参数顺序
          vec3 direction = reflect(eyeToSurfaceDir,worldNormal);
          
          // textureCube 需要vec3 方向值
          gl_FragColor = textureCube(u_texture, direction);
        }` ;

    var program = webglUtils.createProgramFromSources(gl, [vertexCode, fragCode]);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, width, height);
    gl.useProgram(program);

    // 物体的世界坐标
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    // 法向量
    var normalLocation = gl.getAttribLocation(program, "a_normal");
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    setNormals(gl);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLocation);
    // 计算投影矩阵
    var projectionLocation = gl.getUniformLocation(program, "u_projection");
    var aspect = width / height;
    var fieldOfViewRadians = degToRad(60);
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
    // 相机视图
    var viewLocation = gl.getUniformLocation(program, "u_view");
    var cameraPosition = [0, 0, 2];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);
    // 通过相机的世界矩阵计算视图矩阵
    var viewMatrix = m4.inverse(cameraMatrix);
    gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
    // 通过指定纹理单元读取纹理颜色数据
    var textureLocation = gl.getUniformLocation(program, "u_texture");
    gl.uniform1i(textureLocation, 0);
    // 纹理坐标
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    let pages = [
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
    pages.forEach((faceInfo) => {
        const { target, url } = faceInfo;
        // 上传画布到立方体贴图的每个面
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 512;
        const height = 512;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        // 设置每个面，使其立即可渲染
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
        // 异步加载图片
        const image = new Image();
        image.src = url;
        image.addEventListener('load', function () {
            // 图片加载完成将其拷贝到纹理作为纹理颜色数据
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });
    });
    // 告诉WebGL生成一个立方体纹理
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    // 相机的世界坐标
    var worldCameraPositionLocation = gl.getUniformLocation(program, "u_worldCameraPosition");
    gl.uniform3fv(worldCameraPositionLocation, cameraPosition);

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var modelXRotationRadians = degToRad(0);
    var modelYRotationRadians = degToRad(0);

    var worldLocation = gl.getUniformLocation(program, "u_world");
    function drawScene() {
        modelYRotationRadians += 0.002;
        modelXRotationRadians += 0.002;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // 立方体的变换矩阵
        var worldMatrix = m4.xRotation(modelXRotationRadians);
        worldMatrix = m4.yRotate(worldMatrix, modelYRotationRadians);

        gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);

        requestAnimationFrame(drawScene);
    }
    requestAnimationFrame(drawScene);
}

function setGeometry(gl) {
    var positions = new Float32Array(
        [
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,

            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,

            -0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,

            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,

            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, -0.5,

            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,

        ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}
function setNormals(gl) {
    var normals = new Float32Array(
        [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
        ]);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}