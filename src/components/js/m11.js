export default function m11(can) {
    // 每次绘制新形状时，都需要重复以下这些步骤
    // 获取webgl图形执行
    const gl = can.getContext('webgl');
    var vertices = [
        -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
        -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
        -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1,
        1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
        -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1,
        -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
    ];

    var colors = [
        5, 3, 7, 5, 3, 7, 5, 3, 7, 5, 3, 7,
        1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3,
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 1, 0, 1, 1, 0.2, 1, 1, 0, 1, 1, 0,
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
    ];
    var indices = [
        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
    ];

    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    var index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    var vertCode = "attribute vec3 position;" +
        "uniform mat4 Pmatrix;" +
        "uniform mat4 Vmatrix;" +
        "uniform mat4 Mmatrix;" +
        "attribute vec3 color;" +
        "varying vec3 vColor;" +
        "void main(void) { " +
        "gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);" +
        "vColor = color;" +
        "}";
    var fragCode = "precision mediump float;" +
        "varying vec3 vColor;" +
        "void main(void) {" +
        "gl_FragColor = vec4(vColor, 1.);" +
        "}";
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(vertShader);
    gl.compileShader(fragShader);

    var shaderprogram = gl.createProgram();
    gl.attachShader(shaderprogram, vertShader);
    gl.attachShader(shaderprogram, fragShader);
    gl.linkProgram(shaderprogram);
    gl.useProgram(shaderprogram);

    var _Pmatrix = gl.getUniformLocation(shaderprogram, "Pmatrix");
    var _Vmatrix = gl.getUniformLocation(shaderprogram, "Vmatrix");
    var _Mmatrix = gl.getUniformLocation(shaderprogram, "Mmatrix");

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    var _position = gl.getAttribLocation(shaderprogram, "position");
    gl.enableVertexAttribArray(_position);
    gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    var _color = gl.getAttribLocation(shaderprogram, "color");
    gl.enableVertexAttribArray(_color);
    gl.vertexAttribPointer(_color, 3, gl.FLOAT, false, 0, 0);

    var proj_matrix = projection(40, can.offsetWidth / can.offsetHeight, 1, 100);
    var mo_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -6, 1];

    var AMORTIZATION = 0.95;
    var drag = false;
    var old_x, old_y;
    var dX = 0, dY = 0;
    var THETA = 0, PHI = 0;

    var mouseDown = function (e) {
        drag = true;
        old_x = e.pageX, old_y = e.pageY;
        e.preventDefault();
        return false;
    };

    var mouseUp = function (e) {
        drag = false;
    };

    var mouseMove = function (e) {
        if (!drag) return false;
        dX = (e.pageX - old_x) * 2 * Math.PI / can.offsetWidth,
            dY = (e.pageY - old_y) * 2 * Math.PI / can.offsetHeight;
        THETA += dX;
        PHI += dY;
        old_x = e.pageX, old_y = e.pageY;
        e.preventDefault();
    };

    can.addEventListener("mousedown", mouseDown, false);
    can.addEventListener("mouseup", mouseUp, false);
    can.addEventListener("mouseout", mouseUp, false);
    can.addEventListener("mousemove", mouseMove, false);

    (function animate() {
        if (!drag) {
            dX *= AMORTIZATION, dY *= AMORTIZATION;
            THETA += dX, PHI += dY;
        }
        mo_matrix[0] = 1, mo_matrix[1] = 0, mo_matrix[2] = 0, mo_matrix[3] = 0,
            mo_matrix[4] = 0, mo_matrix[5] = 1, mo_matrix[6] = 0, mo_matrix[7] = 0,
            mo_matrix[8] = 0, mo_matrix[9] = 0, mo_matrix[10] = 1, mo_matrix[11] = 0,
            mo_matrix[12] = 0, mo_matrix[13] = 0, mo_matrix[14] = 0, mo_matrix[15] = 1;

        rotateY(mo_matrix, THETA);
        rotateX(mo_matrix, PHI);

        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.5, 0.5, 0.5, 0.9);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0.0, 0.0, can.offsetWidth, can.offsetHeight);

        gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix);
        gl.uniformMatrix4fv(_Vmatrix, false, view_matrix);
        gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        // gl.UNSIGNED_BYTE,无符号字节，UInt8Array
        // gl.SHORT，短整形，Int16Array
        // gl.UNSIGNED_SHORT,无符号短整形，Uint16Array
        // gl.INT,整形，Int32Array
        // gl.UNSIGNED_INT, 无符号整形，Uint32Array
        // gl.FLOAT,浮点型，Float32Array
        requestAnimationFrame(animate);
    })(0)
}
function projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180);
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
}
function rotateX(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1], mv5 = m[5], mv9 = m[9];
    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;
    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
}
function rotateY(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];
    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];
    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}