
export default function (can) {
    const gl = can.getContext('webgl'); // 获取webgl图形执行

    // 创建顶点着色器，画每个顶点都会调用一次的程序代码
    var vertShader = gl.createShader(gl.VERTEX_SHADER); // 创建顶点着色器
    var vertCode =
        `attribute vec4 a_position;
      
      uniform mat4 u_worldView;
      uniform mat4 u_projection;
      
      varying vec3 v_position;
      varying vec2 v_texcoord;
      
      void main() {
        gl_Position = u_projection * u_worldView * a_position;
        v_position = (u_worldView * a_position).xyz;
      }`;
    gl.shaderSource(vertShader, vertCode); // 将着色器代码附加到着色器
    gl.compileShader(vertShader); // 编译程序

    // 片段着色器代码，为每个像素附颜色时运行的代码
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER); // 创建片段着色器
    var fragCode = `
    precision mediump float;
    varying vec3 v_position;
    uniform vec4 u_fogColor;
    uniform float u_fogDensity;
  
    void main() {
      vec4 color = vec4(0.2,0.4,0.1,1);
    
      #define LOG2 1.442695
      float fogDistance = length(v_position);
      // exp2 计算2 x方 的值
      float fogAmount = 1. - exp2(-u_fogDensity * u_fogDensity * fogDistance * fogDistance * LOG2);
      // clamp(a,b,x)  如果 x 值小于 a，则返回 a；如果 x 值大于 b，返回 b；否则，返回 x
      fogAmount = clamp(fogAmount, 0., 1.);
    
      gl_FragColor = mix(color, u_fogColor, fogAmount);  
    }`;
    gl.shaderSource(fragShader, fragCode); // 将着色器代码附加到着色器
    gl.compileShader(fragShader); // 编译程序

    // 创建一个程序对象
    var program = gl.createProgram();
    // 附加着色器
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    // 链接着色器
    gl.linkProgram(program);
    // 使用程序
    gl.useProgram(program);

    var positionLocation = gl.getAttribLocation(program, "a_position");
    var projectionLocation = gl.getUniformLocation(program, "u_projection");
    var worldViewLocation = gl.getUniformLocation(program, "u_worldView");
    var fogColorLocation = gl.getUniformLocation(program, "u_fogColor");
    var fogDensityLocation = gl.getUniformLocation(program, "u_fogDensity");

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var fieldOfViewRadians = degToRad(60);
    var modelXRotationRadians = degToRad(0);
    var modelYRotationRadians = degToRad(0);
    var fogColor = [0.8, 0.9, 1, 1];
    var settings = {
        fogDensity: 0.092,
        xOff: 1.1,
        zOff: 1.4,
    };
    var then = 0;
    drawScene(then);
    function drawScene(time) {
        time *= 0.001;
        var deltaTime = time - then;
        then = time;
        gl.viewport(0, 0, can.clientWidth, can.clientHeight);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        modelYRotationRadians += -0.7 * deltaTime;
        modelXRotationRadians += -0.4 * deltaTime;

        gl.clearColor(...fogColor);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        // 设置世界坐标下的投影视图矩阵
        var projectionMatrix = perspective(fieldOfViewRadians, can.clientWidth / can.clientHeight, 1, 2000);

        var cameraPosition = [0, 0, 2];
        var up = [0, 1, 0];
        var target = [0, 0, 1.9];
        // 设置世界坐标下的相机矩阵
        var cameraMatrix = lookAt(cameraPosition, target, up);
        var viewMatrix = inverse(cameraMatrix);
        gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);

        gl.uniform4fv(fogColorLocation, fogColor);
        gl.uniform1f(fogDensityLocation, settings.fogDensity);

        const numCubes = 10;
        for (let i = 0; i <= numCubes; ++i) {
            var worldViewMatrix = translate(viewMatrix, -2 + i * settings.xOff, 0, -i * settings.zOff);
            worldViewMatrix = xRotate(worldViewMatrix, modelXRotationRadians + i * 0.8);
            worldViewMatrix = yRotate(worldViewMatrix, modelYRotationRadians + i * 0.5);

            gl.uniformMatrix4fv(worldViewLocation, false, worldViewMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
        }
        requestAnimationFrame(drawScene);
    }

    let nd = document.getElementById('nd1'),
        nds = document.getElementById('nd1s');
    nd.addEventListener('input', (e) => {
        let val = +e.target.value;
        nds.innerHTML = val
        settings.fogDensity = val;
        drawScene(then);
    })
}

function setGeometry(gl) {
    var positions = new Float32Array([
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
function subtractVectors(a, b, dst) {
    dst = dst || new Float32Array(3);
    dst[0] = a[0] - b[0];
    dst[1] = a[1] - b[1];
    dst[2] = a[2] - b[2];
    return dst;
}
function normalize(v, dst) {
    dst = dst || new Float32Array(3);
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0.00001) {
        dst[0] = v[0] / length;
        dst[1] = v[1] / length;
        dst[2] = v[2] / length;
    }
    return dst;
}
function cross(a, b, dst) {
    dst = dst || new Float32Array(3);
    dst[0] = a[1] * b[2] - a[2] * b[1];
    dst[1] = a[2] * b[0] - a[0] * b[2];
    dst[2] = a[0] * b[1] - a[1] * b[0];
    return dst;
}
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
function translate(m, tx, ty, tz) {
    return multiply(m, translation(tx, ty, tz));
}
function xRotate(m, angleInRadians) {
    return multiply(m, xRotation(angleInRadians));
}
function yRotate(m, angleInRadians) {
    return multiply(m, yRotation(angleInRadians));
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
