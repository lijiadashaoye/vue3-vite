
export default async function m6(can) {
    let gl = can.getContext('webgl');
    var vertices = [
        -0.5, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
        0.5, 0.5, 0.0
    ],
        indices = [3, 2, 1, 3, 1, 0];

    // gl.createBuffer创建一个缓冲；
    // gl.bindBuffer是设置缓冲为当前使用缓冲； 
    // gl.bufferData将数据拷贝到缓冲
    // 一旦数据存到缓冲中，还需要告诉WebGL怎么从缓冲中提取数据。用 vertexAttribPointer()

    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // 存储调用顶点数组的索引顺序数据，创建buffer即可
    var Index_Buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    let vertCode = `
        attribute vec4 coordinates;
        attribute vec4 color;
        varying vec4 vColor;
        void main() {
          gl_Position = vec4(coordinates);
          vColor = color;
        }`,
        fragCode = `
        precision mediump float;
        varying vec4 vColor;
        void main() {
          gl_FragColor = vec4(vColor);
        }`;
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(vertShader);
    gl.compileShader(fragShader);

    // 着色器程序对象
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.enableVertexAttribArray(coord);
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

    var color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);

    var color = gl.getAttribLocation(shaderProgram, "color");
    gl.enableVertexAttribArray(color);

    // 数据类型是 Uint8Array 位的 UNSIGNED_BYTE 类型。
    // let colors = makeColor1()
    // gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);
    // gl.vertexAttribPointer(color, 4, gl.UNSIGNED_BYTE, true, 0, 0);

    // 数据类型是 Float32Array 位的 FLOAT 类型。
    let colors = makeColor2()
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, true, 0, 0);

    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, can.offsetWidth, can.offsetHeight); // 设置视图端口

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // gl.UNSIGNED_BYTE,无符号字节，UInt8Array
    // gl.SHORT，短整形，Int16Array
    // gl.UNSIGNED_SHORT,无符号短整形，Uint16Array
    // gl.INT,整形，Int32Array
    // gl.UNSIGNED_INT, 无符号整形，Uint32Array
    // gl.FLOAT,浮点型，Float32Array

    function makeColor1() {
        let arr = [];
        for (let i = 0; i < 16; i++) {
            if (i % 3) {
                arr.push(Math.trunc(Math.random() * 256))
            } else {
                arr.push(255)
            }
        }
        return arr
    }
    function makeColor2() {
        let arr = [];
        for (let i = 0; i < 16; i++) {
            if (i % 3) {
                arr.push(Math.trunc(Math.random() * 10) / 10)
            } else {
                arr.push(1)
            }
        }
        return arr
    }
}