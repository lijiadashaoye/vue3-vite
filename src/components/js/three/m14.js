export default async function (can) {

    const gl = can.getContext('webgl'); // 获取webgl图形执行
    let width = can.offsetWidth,
        height = can.offsetHeight;
    // 创建点着色器程序
    // vec4是一个有四个浮点数据的数据类型
    let vertexcode = `
    attribute vec2 position;
    uniform vec2 u_resolution;
    void main(){
        // 从像素坐标转换到 0.0 到 1.0
        vec2 zeroToOne = position / u_resolution;
        // 再把 0->1 转换 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;
        // 把 0->2 转换到 -1->+1 (裁剪空间)
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position=vec4(clipSpace* vec2(1, -1), 0, 1);
    }`;
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexcode);
    gl.compileShader(vertexShader);

    // 创建片着色器程序
    let fragCode = `
        precision mediump float;
        uniform vec4 u_color;
        void main(){
        gl_FragColor = u_color;
    }`;
    let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    // 创建程序对象
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 设置全局变量 分辨率
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, width, height);

    // 找到着色器中的变量
    let position = gl.getAttribLocation(program, 'position');
    // 创建定点缓冲
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // 初次创建
    // 首先我们需要启用对应属性
    gl.enableVertexAttribArray(position);
    // gl.vertexAttribPointer是将属性绑定到当前的ARRAY_BUFFER
    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // 激活缓存
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // 设置片段着色器里的变量 u_color
    var colorUniformLocation = gl.getUniformLocation(program, "u_color");
    for (var ii = 0; ii < 10; ++ii) {
        setRectangle(
            gl, randomInt(width), randomInt(height), randomInt(width), randomInt(height));
        gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function randomInt(range) {
        return Math.floor(Math.random() * range);
    }
    function setRectangle(gl, x, y, width, height) {
        var x1 = x;
        var x2 = x + width;
        var y1 = y;
        var y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]), gl.STATIC_DRAW);
    }



}

