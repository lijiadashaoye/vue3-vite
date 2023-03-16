
export default async function (can) {

    const gl = can.getContext('webgl'); // 获取webgl图形执行
    let width = can.offsetWidth,
        height = can.offsetHeight;

    gl.viewport(0, 0, width, height);
    gl.clearColor(1, 1, 1, 1);
    fn1(gl)

    document.getElementById('fn1').addEventListener('click', () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        fn1(gl)
    })
    document.getElementById('fn2').addEventListener('click', () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        fn2(gl)
    })
    document.getElementById('fn3').addEventListener('click', () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        fn3(gl, width, height)
    })
}

function fn1(gl) {
    let pro1 = new Promise(res => {
        let image1 = new Image();
        image1.crossOrigin = "";
        image1.src = './src/assets/1.png'
        image1.onload = function (e) {
            res(image1)
        };
    }),
        pro2 = new Promise(res => {
            let image2 = new Image();
            image2.crossOrigin = "";
            image2.src = './src/assets/2.png'
            image2.onload = function (e) {
                res(image2)
            };
        })
    Promise.all([pro1, pro2]).then(res => {
        toRender(gl, res)
    })
}
function toRender(gl, imgs) {
    let verCode = `
        attribute vec4 a_Position;
        attribute vec2 a_TexCoord;
        varying vec2 v_textcoord;

        void main(){
            gl_Position=a_Position;
            v_textcoord = a_TexCoord;
        }`,
        fragCode = `
        precision mediump float;
        varying vec2 v_textcoord;
        uniform sampler2D u_sampler0;
        uniform sampler2D u_sampler1;

        void main(){
            vec4 color1 = texture2D(u_sampler0,v_textcoord);
            vec4 color2 = texture2D(u_sampler1,v_textcoord);
            gl_FragColor= color1 * color2;
        }`,
        verShader = gl.createShader(gl.VERTEX_SHADER),
        fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(verShader, verCode)
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(verShader)
    gl.compileShader(fragShader);

    let program = gl.createProgram();
    gl.attachShader(program, verShader)
    gl.attachShader(program, fragShader);
    gl.linkProgram(program)
    gl.useProgram(program);
    // 顶点的坐标是相对canvas来计算的
    // 纹理的坐标，是相对图片来计算的，如果让填充区域显示的比图片大（图片缩小显示），就要让纹理坐标大于1
    // 变换的时候，相当于假定图片的坐标为0-1，如果让图片缩小显示，那就把顶点坐标向左，向上移动相应图片尺寸多少倍数，
    // 然后将图片尺寸和填充区域尺寸对换，图片的原点是做下角（0，0）

    // let arr = [
    //     -0.5, 0.5, -0.5, 0.5,
    //     -0.5, -0.5, -0.5, -0.5,
    //     0.5, 0.5, 0.5, 0.5,
    //     0.5, -0.5, 0.5, -0.5,
    // ]
    // 顶点坐标决定在画布哪里显示纹理，纹理坐标决定显示纹理图片的那块区域
    let arr = [
        // 顶点坐标    纹理坐标(以图片尺寸为坐标系 0 - 1)
        -0.99, 0.99, 0.0, 1.0,
        -0.99, -0.1, 0.0, 0.0,
        0.1, 0.99, 1.0, 1.0,
        0.1, -0.1, 1.0, 0.0,
    ]
    var verticesTex = new Float32Array(arr);
    var vertexTexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTex, gl.STATIC_DRAW);

    var fsize = verticesTex.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, fsize * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
    gl.enableVertexAttribArray(a_TexCoord);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, fsize * 4, fsize * 2);

    // 翻转Y轴，因为图片的Y轴正方向向下，纹理坐标的Y轴向上
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

    imgs.map(t => {
        // 创建纹理
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // 设置筛选器，让我们可以绘制任何尺寸的图像
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // 将图像上传到纹理
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t)
        return texture
    })
        .forEach((t, i) => {
            let u_sampler0 = gl.getUniformLocation(program, `u_sampler${i}`);
            gl.uniform1i(u_sampler0, i);
            gl.activeTexture(gl[`TEXTURE${i}`])
            gl.bindTexture(gl.TEXTURE_2D, t);
        })
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 绑定纹理数据要在创建完所有纹理后执行，以下是错误写法
    // imgs.forEach((t, i) => {
    //     // 创建纹理
    //     let texture = gl.createTexture();
    //     gl.bindTexture(gl.TEXTURE_2D, texture);
    //     // 设置筛选器，让我们可以绘制任何尺寸的图像
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //     // 将图像上传到纹理
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t)
    //     let u_sampler = gl.getUniformLocation(program, `u_sampler${i}`);
    //     gl.uniform1i(u_sampler, i);
    //     gl.activeTexture(gl[`TEXTURE${i}`])
    //     gl.bindTexture(gl.TEXTURE_2D, texture);
    // })
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
function fn2(gl) {
    let verCode = `
    attribute vec4 point;
    attribute vec2 texcoord;
    varying vec2 texCoord;
    void main(){
        gl_Position=vec4(point);
        texCoord=texcoord;
    }`,
        fragCord = `
    precision mediump float;
    varying vec2 texCoord;
    uniform sampler2D sampler;
    void main(){gl_FragColor=texture2D(sampler,texCoord);}`,
        verShader = gl.createShader(gl.VERTEX_SHADER),
        fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(verShader, verCode)
    gl.shaderSource(fragShader, fragCord)
    gl.compileShader(verShader)
    gl.compileShader(fragShader);

    let program = gl.createProgram();
    gl.attachShader(program, verShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)
    gl.useProgram(program);

    let arr = [
        0, 1, -0.6, 1.2,
        0, 0, -0.6, -0.5,
        1, 1, 1.8, 1.2,
        1, 0, 1.8, -0.5
    ], data = new Float32Array(arr),
        size = data.BYTES_PER_ELEMENT,
        buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    let point = gl.getAttribLocation(program, 'point');
    gl.vertexAttribPointer(point, 2, gl.FLOAT, false, size * 4, 0);
    gl.enableVertexAttribArray(point)

    let texcoord = gl.getAttribLocation(program, 'texcoord');
    gl.vertexAttribPointer(texcoord, 2, gl.FLOAT, false, size * 4, size * 2);
    gl.enableVertexAttribArray(texcoord)

    var image1 = new Image();
    image1.crossOrigin = "";
    image1.src = './src/assets/1.png'
    image1.onload = function (e) {
        render(e.target)
    };
    function render(img) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
        let sampler = gl.getUniformLocation(program, 'sampler');
        gl.activeTexture(gl.TEXTURE2)
        gl.uniform1i(sampler, 2);

        let texBuffer = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texBuffer);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
}
function fn3(gl, width, height) {
    var image = new Image();
    image.crossOrigin = "";
    image.src = 'https://img2.baidu.com/it/u=1395980100,2999837177&fm=253&fmt=auto&app=120&f=JPEG?w=1200&h=675'
    image.width = width;
    image.height = height;
    image.onload = function () {
        render(image);
    };
    function render(image) {
        let vertexCode = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            uniform vec2 u_resolution;
            varying vec2 v_texCoord;
            void main() {
               vec2 clipSpace = (a_position / u_resolution)*2.0 - 1.0;
               gl_Position = vec4(clipSpace * vec2(1, 1), 0, 1);
               v_texCoord = a_texCoord;
            }`;
        let fragCode = `
            precision mediump float;
            // 纹理
            uniform sampler2D u_image;
            varying vec2 v_texCoord;
            void main() {
            gl_FragColor = texture2D(u_image, v_texCoord);
            }`;
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(vertexShader, vertexCode)
        gl.shaderSource(fragShader, fragCode);
        gl.compileShader(vertexShader)
        gl.compileShader(fragShader);

        let program = gl.createProgram();
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragShader)
        gl.linkProgram(program)
        gl.useProgram(program);

        // 点着色器坐标 buffer
        let positionBuffer = gl.createBuffer(),
            positionArray = [
                0, 0,
                width, 0,
                0, height,
                width, 0,
                width, height,
                0, height
            ],
            positionLocation = gl.getAttribLocation(program, "a_position");
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionArray), gl.STATIC_DRAW);

        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 设置分辨率
        var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionLocation, width, height);
        // 给矩形提供纹理坐标
        let texcoordBuffer = gl.createBuffer(),
            texcoordArray = [
                -0.2, -0.2,
                1.2, -0.2,
                -0.2, 1.2,
                1.2, -0.2,
                1.2, 1.2,
                -0.2, 1.2
            ],
            texcoordLocation = gl.getAttribLocation(program, "a_texCoord");
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
        gl.enableVertexAttribArray(texcoordLocation);
        gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoordArray), gl.STATIC_DRAW);

        // 设置纹理单元
        var u_imageLoc = gl.getUniformLocation(program, "u_image");
        gl.activeTexture(gl.TEXTURE0)
        gl.uniform1i(u_imageLoc, 0);

        // 创建纹理
        // 染纹理时需要纹理坐标，而不是像素坐标。无论纹理是什么尺寸，纹理坐标范围始终是 0.0 到 1.0 。
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // 第一个参数指定了纹理坐标，上面是使用的2D纹理
        // 第二个参数是指定设置的坐标轴
        // 第三个参数是环绕方式
        // 纹理环绕方式
        // gl.REPEAT	重复纹理图像，如要图片是标准的 2的N次方像素的，正方形图片
        // gl.MIRRORED_REPEAT 和 gl.REPEAT 一样，每次图形是镜像放置的.
        // gl.CLAMP_TO_EDGE	纹理坐标会被约束在0-1之前，超出的部份会重复纹理坐标的边缘，产生一种边缘被拉伸的效果
        // gl.CLAMP_TO_BORDER	超出的坐标为用户指定的边缘颜色。
        // 如果用 GL_CLAMP_TO_BORDER,还需要指定一个边缘颜色 texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, borderColor);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);  // TEXTURE_WRAP_S：水平方向填充方式，当填充面积大于图片时，其他位置怎么填充
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);// TEXTURE_WRAP_T：竖直方向填充方式，当填充面积大于图片时，其他位置怎么填充
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);// TEXTURE_MIN_FILTER：缩小方式，当图片大小，大于填充面积时
        // 对于 TEXTURE_MAG_FILTER 只有 NEAREST 和 LINEAR 两个可选设置。
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);// TEXTURE_MAG_FILTER：放大方式，当图片大小，小于填充面积时
        //  将图像上传到纹理
        // gl.TEXTURE_2D: 二维纹理贴图。
        // 0 级是基本图像等级
        // gl.RGBA: 从颜色缓冲区读取红色、绿色、蓝色和 alpha 组件。
        // gl.UNSIGNED_BYTE 指定纹理数据格式，gl.UNSIGNED_BYTE: gl.RGBA每个通道 8 位，无符号整型
        // image 作纹理的像素源
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

