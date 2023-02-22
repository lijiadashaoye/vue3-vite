export default function (can) {

    let gl = can.getContext('webgl'),
        width = can.offsetWidth,
        height = can.offsetHeight;

    let vertexCode = `
    // 对于三维，即使我们没有提供 'w', 默认的 1 正是矩阵运算需要的值。
    // 所以 vec4 a_position = vec4(a_position,1)

        attribute vec3 a_position;
        attribute vec4 a_color;
        uniform mat4 u_matrix;
        varying vec4 v_color;
        void main() {
            gl_Position = u_matrix * vec4(a_position,1);
            v_color = a_color;
        }`,
        fragCode = `
        precision mediump float;
        varying vec4 v_color;
        void main() {
           gl_FragColor = v_color;
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
    // 设置点着色器
    let positionBuffer = gl.createBuffer();
    let pointArray = [
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
        0, 150, 0
    ]
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointArray), gl.STATIC_DRAW);

    var colorLocation = gl.getAttribLocation(program, "a_color");
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(setColors()), gl.STATIC_DRAW)
    gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.enableVertexAttribArray(colorLocation)

    gl.viewport(0, 0, width, height); // 设置视图端口
    gl.clearColor(1, 1, 1, 1);

    var matrixLocation = gl.getUniformLocation(program, "u_matrix");
    let tx = document.getElementById('tx'),
        ty = document.getElementById('ty'),
        tz = document.getElementById('tz'),
        txs = document.getElementById('txs'),
        tys = document.getElementById('tys'),
        tzs = document.getElementById('tzs'),
        rx = document.getElementById('rx'),
        ry = document.getElementById('ry'),
        rz = document.getElementById('rz'),
        rxs = document.getElementById('rxs'),
        rys = document.getElementById('rys'),
        rzs = document.getElementById('rzs'),
        sx = document.getElementById('sx'),
        sy = document.getElementById('sy'),
        sz = document.getElementById('sz'),
        sxs = document.getElementById('sxs'),
        sys = document.getElementById('sys'),
        szs = document.getElementById('szs'),
        sf = document.getElementById('sf'),
        sfs = document.getElementById('sfs');

    var translationArr = [-150, 0, -360];
    var rotation = [0, 0, 0];
    var scaleArr = [1, 1, 1];
    var hudu = 2  // 弧度值
    setPosition()

    tx.addEventListener('input', (e) => {
        let x = +e.target.value
        txs.innerHTML = x
        translationArr[0] = x
        setPosition()
    })
    ty.addEventListener('input', (e) => {
        let y = +e.target.value
        tys.innerHTML = y
        translationArr[1] = y
        setPosition()
    })
    tz.addEventListener('input', (e) => {
        let z = +e.target.value
        tzs.innerHTML = z
        translationArr[2] = z
        setPosition()
    })
    rx.addEventListener('input', (e) => {
        let value = +e.target.value;
        rxs.innerHTML = value;
        rotation[0] = value * Math.PI / 180
        setPosition()
    })
    ry.addEventListener('input', (e) => {
        let value = +e.target.value;
        rys.innerHTML = value;
        rotation[1] = value * Math.PI / 180
        setPosition()
    })
    rz.addEventListener('input', (e) => {
        let value = +e.target.value;
        rzs.innerHTML = value;
        rotation[2] = value * Math.PI / 180
        setPosition()
    })
    sx.addEventListener('input', (e) => {
        let val = +e.target.value
        sxs.innerHTML = val
        scaleArr[0] = val
        setPosition()
    })
    sy.addEventListener('input', (e) => {
        let val = +e.target.value
        sys.innerHTML = val
        scaleArr[1] = val
        setPosition()
    })
    sz.addEventListener('input', (e) => {
        let val = +e.target.value
        szs.innerHTML = val
        scaleArr[2] = val
        setPosition()
    })
    sf.addEventListener('input', (e) => {
        let val = +e.target.value
        sfs.innerHTML = val
        hudu = val * Math.PI / 180  // 角度转弧度
        setPosition()
    })

    function setPosition() {
        gl.enable(gl.CULL_FACE);
        // WebGL绘制一个着色像素之前会检查对应的深度像素， 
        // 如果对应的深度像素中的深度值小于当前像素的深度值，WebGL就不会绘制新的颜色。 
        // 反之它会绘制片段着色器提供的新颜色并更新深度像素中的深度值。 
        // 这也意味着在其他像素后面的像素不会被绘制。
        // 开启隐藏面消除功能
        gl.enable(gl.DEPTH_TEST);
        // 在绘制任意一帧之前，必须清除深度缓冲区，以消除绘制上一帧时在其中留下的痕迹
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // 启用多边形偏移 
        gl.enable(gl.POLYGON_OFFSET_FILL)
        // 在绘制之前指定用来计算偏移量的参数 
        gl.polygonOffset(1.0, 1.0)
        var aspect = can.clientWidth / can.clientHeight;
        var zNear = 1;
        var zFar = 2000;
        // 投影视图矩阵
        var matrix = perspective(hudu, aspect, zNear, zFar);
        matrix = translate(matrix, ...translationArr);
        matrix = xRotate(matrix, rotation[0]);
        matrix = yRotate(matrix, rotation[1]);
        matrix = zRotate(matrix, rotation[2]);
        matrix = scale(matrix, ...scaleArr);

        gl.uniformMatrix4fv(matrixLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, pointArray.length / 3);
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
            0, 0, 0, 1
        ];
    };
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
    function projection(width, height, depth) {
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            0, 0, 0, 1
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
    function setColors() {
        return [
            // left column front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // top rung front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // middle rung front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // left column back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // top rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // middle rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // top
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,

            // top rung right
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,

            // under top rung
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,

            // between top rung and middle
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,

            // top of middle rung
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,

            // right of middle rung
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,

            // bottom of middle rung.
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,

            // right of bottom
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,

            // bottom
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,

            // left side
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220]
    }
    function perspective(hudu, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * hudu);
        var rangeInv = 1.0 / (near - far);
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }
}
