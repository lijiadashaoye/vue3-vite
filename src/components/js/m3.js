export default function m3(can) {
    let gl = can.getContext('webgl')
    var vertices = [
        -0.5, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
    ], indices = [0, 1, 2];
    // 缓冲操作是在GPU上获取顶点和其他顶点数据的一种方式。 
    // gl.createBuffer创建一个缓冲；
    // gl.bindBuffer是设置缓冲为当前使用缓冲； 
    // gl.bufferData将数据拷贝到缓冲

    // 开启最大索引容量，可以到 4294967296 
    // gl.getExtension('OES_element_index_uint');

    var vertCode = `
    attribute vec3 coordinates;
    void main(void) {gl_Position = vec4(coordinates, 1.0);}`
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    var fragCode = `
        precision mediump float;
        void main(void) {gl_FragColor = vec4(0.0, 0.0, 0.0, 0.2);}`
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);
    // 用三坐标+索引画图
    var Index_Buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    // 如果定点个数超过256个，就要用 Uint16Array
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.viewport(0, 0, can.offsetWidth, can.offsetHeight); // 设置视图端口
    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.TRIANGLES 模式 - 使用原始类型绘制WebGL模型
    // indices.length - 此选项指定要呈现的元素数。
    // gl.UNSIGNED_SHORT - 此选项指定必须为 UNSIGNED_BYTE (Uint8Array) 或 UNSIGNED_SHORT (Uint16Array) 的索引的数据类型
    // 0 - 此选项指定渲染的起始点。它通常是第一个元素（0）
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    // gl.drawArrays(gl.TRIANGLES, 0, 3);

    // gl.UNSIGNED_BYTE,无符号字节，UInt8Array
    // gl.SHORT，短整形，Int16Array
    // gl.UNSIGNED_SHORT,无符号短整形，Uint16Array
    // gl.INT,整形，Int32Array
    // gl.UNSIGNED_INT, 无符号整形，Uint32Array
    // gl.FLOAT,浮点型，Float32Array
}