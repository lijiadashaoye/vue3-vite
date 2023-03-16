import m4 from '../../file/m4'
export default function (can) {
    const gl = can.getContext('webgl'); // 获取webgl图形执行
    let cwidth = can.clientWidth,
        cheight = can.clientHeight;

    let texCode = `
        attribute vec4 a_position;
        attribute vec2 a_texcoord;
        
        uniform mat4 u_matrix;
        varying vec2 v_texcoord;
        
        void main() {
          gl_Position = u_matrix * a_position;
          v_texcoord = a_texcoord;
        }`,
        fragCode = `
        precision mediump float;
        
        varying vec2 v_texcoord;
        uniform sampler2D u_texture;
        uniform vec4 u_colorMult;
        
        void main() {
           gl_FragColor = texture2D(u_texture, v_texcoord)*u_colorMult;
        }`,
        texShader = gl.createShader(gl.VERTEX_SHADER),
        fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(texShader, texCode); // 将着色器代码附加到着色器
    gl.shaderSource(fragShader, fragCode); // 将着色器代码附加到着色器
    gl.compileShader(texShader); // 编译程序
    gl.compileShader(fragShader); // 编译程序

    var program = gl.createProgram();
    gl.attachShader(program, texShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    var positionLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    // 创建纹理坐标
    var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    setTexcoords(gl);
    gl.enableVertexAttribArray(texcoordLocation);
    // 告诉纹理坐标属性如何从 texcoordBuffer 读取数据
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // 棋盘格纹理像素数据
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 使用 gl.generateMipmap(gl.TEXTURE_2D); 时，数据必须为2的倍数

    // 第一种写法，可以是任意数量，棋盘格在正方体中的纹理数据，每个值代表一个颜色0--255
    // var row = 3, col = 4;
    // let data = new Uint8Array([
    //     128, 64, 24,
    //     34, 0, 192,
    //     0, 32, 44,
    //     34, 0, 192,
    // ]);
    // gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);     // 告诉WebGL一次处理 1 个字节，1，2，4 和 8
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, row, col, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);

    // 第二种写法，必须为 2 的倍数
    var row = 4, col = 4;
    let data = new Uint8Array([  // data
        0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF,
    ])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, row, col, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // 创建一个纹理帧缓冲
    const fb = gl.createFramebuffer();
    // 绑定帧缓冲后，每次调用 gl.clear, gl.drawArrays, 或 gl.drawElements，
    // WebGL都会使用帧缓冲作为纹理像素数据
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // 渲染缓冲区对象必须和纹理对象大小一样
    // 创建渲染缓冲区对象，以进行隐藏面消除
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    // 蓝色正方体纹理像素数据
    const targetTextureWidth = 256;
    const targetTextureHeight = 256;
    // 设置深度缓冲的画布大小，DEPTH_COMPONENT16 表示渲染缓冲区将替代深度缓冲区
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, targetTextureWidth, targetTextureHeight);
    // 将渲染缓冲区对象绑定到帧缓冲对象，相当于给帧缓冲添加像素数据 
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // 创建纹理对象
    const targetTexture = gl.createTexture(); // 正方体在画布中的纹理数据
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    // data 是 null，我们不需要提供像素数据，只需要让WebGL分配一个纹理
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, targetTextureWidth, targetTextureHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // 将纹理对象绑定到帧缓冲对象，相当于给帧缓冲添加纹理坐标
    // framebufferTexture2D(target, attachment, textarget, texture, level)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);

    // WebGL只允许的附件组合形式:
    // RGBA/UNSIGNED_BYTE （纹理数据） + COLOR_ATTACHMENT0 （帧缓存）
    // RGBA/UNSIGNED_BYTE （纹理数据） + COLOR_ATTACHMENT0 （帧缓存）+ DEPTH_COMPONENT16 （深度缓存大小）+ DEPTH_ATTACHMENT （缓存类型：深度缓存）

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var fieldOfViewRadians = degToRad(60);
    var modelXRotationRadians = degToRad(0);
    var modelYRotationRadians = degToRad(0);
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");
    var colorMultLocation = gl.getUniformLocation(program, "u_colorMult");
    var textureLocation = gl.getUniformLocation(program, "u_texture");
    requestAnimationFrame(drawScene);
    function drawScene() {
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        modelYRotationRadians += -0.006;
        modelXRotationRadians += -0.004;

        // 渲染棋盘格纹理到正方体每个面
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
        gl.clearColor(0.1, 0.4, 0.4, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindTexture(gl.TEXTURE_2D, texture); // 指定纹理数据
        const aspect2 = targetTextureWidth / targetTextureHeight;
        drawCube(aspect2);

        // 渲染到画布
        // 调用 gl.bindFramebuffer 设置为 null 是告诉WebGL 你想在画布上绘制，而不是在帧缓冲上。
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, cwidth, cheight);
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);// 指定纹理数据
        const aspect1 = cwidth / cheight;
        drawCube(aspect1);

        requestAnimationFrame(drawScene);
    }
    // 设置相机投影视图
    function drawCube(aspect) {
        // 设置投影视图
        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
        // 设置相机视图
        var cameraPosition = [0, 0, 2];
        var up = [0, 1, 0];
        var target = [0, 0, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);
        // 相机视图逆矩阵
        var viewMatrix = m4.inverse(cameraMatrix);
        // 设置相机视图投影矩阵
        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        // 画三个正方体
        for (let x = -1; x <= 1; ++x) {
            var matrix = m4.translate(viewProjectionMatrix, x * .9, 0, 0);
            matrix = m4.xRotate(matrix, modelXRotationRadians * x);
            matrix = m4.yRotate(matrix, modelYRotationRadians * x);
            gl.uniformMatrix4fv(matrixLocation, false, matrix);
            gl.uniform1i(textureLocation, 0);
            const c = x * .5 + .4;
            gl.uniform4fv(colorMultLocation, [c, 1, 1 - c, 1]);
            gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
        }
    }
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
function setTexcoords(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(
            [
                0, 0,
                0, 1,
                1, 0,
                0, 1,
                1, 1,
                1, 0,

                0, 0,
                0, 1,
                1, 0,
                1, 0,
                0, 1,
                1, 1,

                0, 0,
                0, 1,
                1, 0,
                0, 1,
                1, 1,
                1, 0,

                0, 0,
                0, 1,
                1, 0,
                1, 0,
                0, 1,
                1, 1,

                0, 0,
                0, 1,
                1, 0,
                0, 1,
                1, 1,
                1, 0,

                0, 0,
                0, 1,
                1, 0,
                1, 0,
                0, 1,
                1, 1,

            ]),
        gl.STATIC_DRAW);
}