export default function (can) {
    let gl = can.getContext('webgl');
    // 用三坐标点画图
    var vertices = [
        -0.5, 0.5, -0.9,
        -0.6, -0.5, -0.1,
        0.25, 0.25, 1,
    ];
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var vertCode = `
    attribute vec3 coordinates;
    void main(void) {
        gl_Position = vec4(coordinates, 1.0);
    }`
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode); // 将着色器代码附加到着色器
    gl.compileShader(vertShader); // 编译程序

    var fragCode = `
    void main(void) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.2);
    }`
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader); // 附加着色器
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.viewport(0, 0, can.offsetWidth, can.offsetHeight); // 设置视图端口
    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT); // 清除色彩缓冲位
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}