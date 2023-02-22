export default function (can) {
    let gl = can.getContext('webgl'),
        width = can.offsetWidth,
        height = can.offsetHeight;
    gl.viewport(0, 0, width, height); // 设置视图端口
    gl.clearColor(1, 1, 1, 1);

    let vertexCode = `
          attribute vec4 a_position; // 物体矩阵
          uniform mat4 u_projectMatrix; // 物体的变换矩阵
          uniform mat4 u_viewProjectionMatrix; // 相机视图下的投影视图矩阵

          attribute vec3 a_normal; // 法向量
          uniform mat4 u_worldInverseTranspose; // F的转置求逆矩阵

          varying vec3 v_normal; // 转置求逆后的法向量
          varying vec3 v_position;
          void main() {
            gl_Position = u_viewProjectionMatrix * u_projectMatrix  * a_position;

            // 法向量 * 物体的转置求逆矩阵，是为了在物体发生缩放变换时也保持正确的指向
            v_normal = mat3(u_worldInverseTranspose) * a_normal;
            // 传递点的投影透视矩阵坐标，计算雾化用
            v_position = gl_Position.xyz;
          }`,
        fragCode = `
        precision mediump float;
          varying vec3 v_normal;
          varying vec3 v_position; // 物体的位置
          
          uniform vec3 u_reverseLightDirection; // 世界坐标下的光照位置矩阵
          uniform vec4 u_color; // 表面基底色
          uniform vec3 u_environment; // 环境光

          uniform vec4 u_fogColor; // 雾的颜色
          uniform float u_fogNear; // 雾的近面
          uniform float u_fogFar;  // 雾的远面

          void main() {
            vec3 normal = normalize(v_normal); // 计算归一化向量

            // 法向量与光照方向点乘，计算光的强弱
            float light = dot(normal, u_reverseLightDirection); 
            // 得出物体表面具体的颜色，光的颜色是[1,1,1]
            vec4 color = vec4(u_color.rgb * light + u_environment, u_color.a);

            // 计算视点到相机的距离
            float fogDistance = length(v_position);
            // 计算雾化效果强度
            float fogAmount = smoothstep(u_fogNear, u_fogFar, fogDistance);

            // 计算最终颜色 
            gl_FragColor = color + fogAmount * u_fogColor; 
          }`,
        vertexShader = gl.createShader(gl.VERTEX_SHADER),
        fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vertexCode)
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(vertexShader)
    gl.compileShader(fragShader);

    let program = gl.createProgram();
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    var positionLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    var normalLocation = gl.getAttribLocation(program, "a_normal");
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    setNormals(gl); // 法向量矩阵
    gl.enableVertexAttribArray(normalLocation);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    function degToRad(d) {
        return d * Math.PI / 180;
    }
    var fieldOfViewRadians = degToRad(40);
    var fRotationRadians = 0;
    var tz = 0;
    var near = 10;
    var far = 810;
    draw()

    let yRotate = document.getElementById('yRotate'),
        yRotates = document.getElementById('yRotates'),
        zTranslate = document.getElementById('zTranslate'),
        zTranslates = document.getElementById('zTranslates'),
        nearFace = document.getElementById('nearFace'),
        nearFaces = document.getElementById('nearFaces'),
        farFace = document.getElementById('farFace'),
        farFaces = document.getElementById('farFaces');
    yRotate.addEventListener('input', (e) => {
        let val = +e.target.value;
        yRotates.innerHTML = val
        fRotationRadians = degToRad(val);
        draw();
    })
    zTranslate.addEventListener('input', (e) => {
        let val = +e.target.value;
        zTranslates.innerHTML = val
        tz = val;
        draw();
    })
    nearFace.addEventListener('input', (e) => {
        let val = +e.target.value;
        nearFaces.innerHTML = val
        near = val;
        draw();
    })
    farFace.addEventListener('input', (e) => {
        let val = +e.target.value;
        farFaces.innerHTML = val
        far = val;
        draw();
    })
    function draw() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE); // 只绘制正面或反面三角形
        gl.enable(gl.DEPTH_TEST);

        // 设置默认世界坐标下的投影视图矩阵
        var aspect = width / height;
        var zNear = 0.1;
        var zFar = 1000;
        var projectionMatrix = perspective(fieldOfViewRadians, aspect, zNear, zFar);

        // 设置世界坐标下的相机矩阵，从而盯着某一个方向
        var camera = [80, 50, 240];
        var target = [0, 12, 0];
        var up = [0, 1, 0];
        var cameraMatrix = lookAt(camera, target, up);
        // 相机矩阵的逆矩阵
        var viewMatrix = inverse(cameraMatrix);

        // 将视图矩阵和投影矩阵结合，计算相机视图下的锥形投影视图矩阵（此时假定相机在原点）
        var viewProjectionMatrix = multiply(projectionMatrix, viewMatrix);
        var viewProjectionMatrixLocation = gl.getUniformLocation(program, "u_viewProjectionMatrix");
        gl.uniformMatrix4fv(viewProjectionMatrixLocation, false, viewProjectionMatrix);

        // 世界矩阵里在原点绘制F的变换
        var matrix = identity(); // 初始化一个单位矩阵
        var worldMatrix = yRotation(fRotationRadians); // 旋转
        var worldTranslte = translation(0, 0, tz); // 移动
        var worldScale = scaling(0.9, 0.9, 0.9); // 缩放
        var projectMatrix = multiplyAll([worldMatrix, worldTranslte, worldScale, matrix]);
        var projectMatrixLocation = gl.getUniformLocation(program, "u_projectMatrix");
        gl.uniformMatrix4fv(projectMatrixLocation, false, projectMatrix);

        // 物体的转置求逆矩阵，动态变更法向量用
        var worldInverseTransposeMatrix = transpose(inverse(worldMatrix));
        var worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
        gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);

        // 表面基底色
        var colorLocation = gl.getUniformLocation(program, "u_color");
        gl.uniform4fv(colorLocation, [0.4, 0.9, 0.3, 1]);

        // 环境光
        var colorLocation = gl.getUniformLocation(program, "u_environment");
        gl.uniform3fv(colorLocation, [0.1, 0.1, 0.3]);

        // 设置光照位置矩阵
        var reverseLightDirectionLocation = gl.getUniformLocation(program, "u_reverseLightDirection");
        gl.uniform3fv(reverseLightDirectionLocation, normalize([-0.2, 0.6, 0.7]));

        // 设置雾的颜色
        var fogColorLocation = gl.getUniformLocation(program, "u_fogColor");
        gl.uniform4fv(fogColorLocation, [1, 1, 1, 1]);

        // 雾化效果的远平面
        var nearLocation = gl.getUniformLocation(program, "u_fogNear");
        gl.uniform1f(nearLocation, near);

        // 雾化效果的近平面
        var farLocation = gl.getUniformLocation(program, "u_fogFar");
        gl.uniform1f(farLocation, far);

        gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
    }
}
function setNormals(gl) {
    var normals = new Float32Array([
        // left column front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // top rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // middle rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // left column back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // middle rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // top rung right
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // under top rung
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // between top rung and middle
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // top of middle rung
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // right of middle rung
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom of middle rung.
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // right of bottom
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // left side
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0]);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}
// 设置F的位置
function setGeometry(gl) {
    var positions = new Float32Array([
        // left column front
        0, 0, 0,
        0, 150, 0,
        30, 0, 0,
        0, 150, 0,
        30, 150, 0,
        30, 0, 0,

        // top rung front
        30, 0, 0,
        30, 30, 0,
        100, 0, 0,
        30, 30, 0,
        100, 30, 0,
        100, 0, 0,

        // middle rung front
        30, 60, 0,
        30, 90, 0,
        67, 60, 0,
        30, 90, 0,
        67, 90, 0,
        67, 60, 0,

        // left column back
        0, 0, 30,
        30, 0, 30,
        0, 150, 30,
        0, 150, 30,
        30, 0, 30,
        30, 150, 30,

        // top rung back
        30, 0, 30,
        100, 0, 30,
        30, 30, 30,
        30, 30, 30,
        100, 0, 30,
        100, 30, 30,

        // middle rung back
        30, 60, 30,
        67, 60, 30,
        30, 90, 30,
        30, 90, 30,
        67, 60, 30,
        67, 90, 30,

        // top
        0, 0, 0,
        100, 0, 0,
        100, 0, 30,
        0, 0, 0,
        100, 0, 30,
        0, 0, 30,

        // top rung right
        100, 0, 0,
        100, 30, 0,
        100, 30, 30,
        100, 0, 0,
        100, 30, 30,
        100, 0, 30,

        // under top rung
        30, 30, 0,
        30, 30, 30,
        100, 30, 30,
        30, 30, 0,
        100, 30, 30,
        100, 30, 0,

        // between top rung and middle
        30, 30, 0,
        30, 60, 30,
        30, 30, 30,
        30, 30, 0,
        30, 60, 0,
        30, 60, 30,

        // top of middle rung
        30, 60, 0,
        67, 60, 30,
        30, 60, 30,
        30, 60, 0,
        67, 60, 0,
        67, 60, 30,

        // right of middle rung
        67, 60, 0,
        67, 90, 30,
        67, 60, 30,
        67, 60, 0,
        67, 90, 0,
        67, 90, 30,

        // bottom of middle rung.
        30, 90, 0,
        30, 90, 30,
        67, 90, 30,
        30, 90, 0,
        67, 90, 30,
        67, 90, 0,

        // right of bottom
        30, 90, 0,
        30, 150, 30,
        30, 90, 30,
        30, 90, 0,
        30, 150, 0,
        30, 150, 30,

        // bottom
        0, 150, 0,
        0, 150, 30,
        30, 150, 30,
        0, 150, 0,
        30, 150, 30,
        30, 150, 0,

        // left side
        0, 0, 0,
        0, 0, 30,
        0, 150, 30,
        0, 0, 0,
        0, 150, 30,
        0, 150, 0]);
    var matrix = xRotation(Math.PI);
    matrix = translate(matrix, -50, -75, -15);
    for (var ii = 0; ii < positions.length; ii += 3) {
        var vector = transformPoint(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
        positions[ii + 0] = vector[0];
        positions[ii + 1] = vector[1];
        positions[ii + 2] = vector[2];
    }
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}
function perspective(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);
    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ];
}
function projection(width, height, depth) {
    return [
        2 / width, 0, 0, 0,
        0, -2 / height, 0, 0,
        0, 0, 2 / depth, 0,
        -1, 1, 0, 1,
    ];
}
function multiplyAll(arr) {
    return arr.reduce((all, now) => multiply(all, now))
}

function multiply(a, b) {
    // 4x4 矩阵叉乘
    var n = 0, m = 0,
        a00 = a[n++], a01 = a[n++], a02 = a[n++], a03 = a[n++],
        a10 = a[n++], a11 = a[n++], a12 = a[n++], a13 = a[n++],
        a20 = a[n++], a21 = a[n++], a22 = a[n++], a23 = a[n++],
        a30 = a[n++], a31 = a[n++], a32 = a[n++], a33 = a[n++],
        b00 = b[m++], b01 = b[m++], b02 = b[m++], b03 = b[m++],
        b10 = b[m++], b11 = b[m++], b12 = b[m++], b13 = b[m++],
        b20 = b[m++], b21 = b[m++], b22 = b[m++], b23 = b[m++],
        b30 = b[m++], b31 = b[m++], b32 = b[m++], b33 = b[m++];
    return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
}
function translation(tx, ty, tz) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, tz, 1,
    ];
}
function xRotation(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
    ];
}
function yRotation(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
    ];
}
function zRotation(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}
function scaling(sx, sy, sz) {
    return [
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1,
    ];
}
function translate(m, tx, ty, tz) {
    return multiply(m, translation(tx, ty, tz));
}
function xRotate(m, angleInRadians) {
    return multiply(m, xRotation(angleInRadians));
}
function yRotate(m, angleInRadians) {
    return multiply(m, yRotation(angleInRadians));
}
function zRotate(m, angleInRadians) {
    return multiply(m, zRotation(angleInRadians));
}
function scale(m, sx, sy, sz) {
    return multiply(m, scaling(sx, sy, sz));
}
// 计算逆矩阵
function inverse(m) {
    let n = 0,
        m00 = m[n++], m01 = m[n++], m02 = m[n++], m03 = m[n++],
        m10 = m[n++], m11 = m[n++], m12 = m[n++], m13 = m[n++],
        m20 = m[n++], m21 = m[n++], m22 = m[n++], m23 = m[n++],
        m30 = m[n++], m31 = m[n++], m32 = m[n++], m33 = m[n++];
    var tmp_0 = m22 * m33;
    var tmp_1 = m32 * m23;
    var tmp_2 = m12 * m33;
    var tmp_3 = m32 * m13;
    var tmp_4 = m12 * m23;
    var tmp_5 = m22 * m13;
    var tmp_6 = m02 * m33;
    var tmp_7 = m32 * m03;
    var tmp_8 = m02 * m23;
    var tmp_9 = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
        d * t0,
        d * t1,
        d * t2,
        d * t3,
        d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
        d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
        d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
        d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
        d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
        d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
        d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
        d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
        d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
        d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
        d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
        d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
    ];
}
function vectorMultiply(v, m) {
    var dst = [];
    for (var i = 0; i < 4; ++i) {
        dst[i] = 0.0;
        for (var j = 0; j < 4; ++j) {
            dst[i] += v[j] * m[j * 4 + i];
        }
    }
    return dst;
}
function lookAt(cameraPosition, target, up, dst) {
    dst = dst || new Float32Array(16);
    var zAxis = normalize(
        subtractVectors(cameraPosition, target));
    var xAxis = normalize(cross(up, zAxis));
    var yAxis = normalize(cross(zAxis, xAxis));

    dst[0] = xAxis[0];
    dst[1] = xAxis[1];
    dst[2] = xAxis[2];
    dst[3] = 0;
    dst[4] = yAxis[0];
    dst[5] = yAxis[1];
    dst[6] = yAxis[2];
    dst[7] = 0;
    dst[8] = zAxis[0];
    dst[9] = zAxis[1];
    dst[10] = zAxis[2];
    dst[11] = 0;
    dst[12] = cameraPosition[0];
    dst[13] = cameraPosition[1];
    dst[14] = cameraPosition[2];
    dst[15] = 1;

    return dst;
}
function normalize(v, dst) {
    dst = dst || new Float32Array(3);
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        dst[0] = v[0] / length;
        dst[1] = v[1] / length;
        dst[2] = v[2] / length;
    }
    return dst;
}
function transpose(m, dst) {
    dst = dst || new Float32Array(16);

    dst[0] = m[0];
    dst[1] = m[4];
    dst[2] = m[8];
    dst[3] = m[12];
    dst[4] = m[1];
    dst[5] = m[5];
    dst[6] = m[9];
    dst[7] = m[13];
    dst[8] = m[2];
    dst[9] = m[6];
    dst[10] = m[10];
    dst[11] = m[14];
    dst[12] = m[3];
    dst[13] = m[7];
    dst[14] = m[11];
    dst[15] = m[15];

    return dst;
}
function transformPoint(m, v, dst) {
    dst = dst || new Float32Array(3);
    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];
    var d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];

    dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
    dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
    dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;

    return dst;
}
function subtractVectors(a, b, dst) {
    dst = dst || new Float32Array(3);
    dst[0] = a[0] - b[0];
    dst[1] = a[1] - b[1];
    dst[2] = a[2] - b[2];
    return dst;
}
function cross(a, b, dst) {
    dst = dst || new Float32Array(3);
    dst[0] = a[1] * b[2] - a[2] * b[1];
    dst[1] = a[2] * b[0] - a[0] * b[2];
    dst[2] = a[0] * b[1] - a[1] * b[0];
    return dst;
}
function identity(dst) {
    dst = dst || new Float32Array(16);
    dst[0] = 1;
    dst[1] = 0;
    dst[2] = 0;
    dst[3] = 0;
    dst[4] = 0;
    dst[5] = 1;
    dst[6] = 0;
    dst[7] = 0;
    dst[8] = 0;
    dst[9] = 0;
    dst[10] = 1;
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;
    return dst;
}