
export default async function (can) {

    const gl = can.getContext('webgl'); // 获取webgl图形执行
    let width = can.offsetWidth,
        height = can.offsetHeight;

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
               gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
               v_texCoord = a_texCoord;
            }`;
        let fragCode = `
            precision mediump float;
            // 纹理
            uniform sampler2D u_image; // 纹理数据
            uniform vec2 u_textureSize;
            varying vec2 v_texCoord;  // 纹理坐标
            void main() {
            // 模糊效果
            // 计算1像素对应的纹理坐标
            vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
            // 对左中右3个像素求均值
            gl_FragColor = (
               texture2D(u_image, v_texCoord) +
               texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0)) +
               texture2D(u_image, v_texCoord + vec2(-onePixel.x, 0.0))) / 3.0;
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

        // 设置分辨率
        var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionLocation, width, height);

        // 给矩形提供纹理坐标，WebGL的纹理坐标范围是 0.0 到 1.0
        // 点的顺序与点着色器顺序一样才可以
        let texcoordBuffer = gl.createBuffer(),
            texcoordArray = [
                0, 0,
                width / width, 0,
                0, height / height,
                width / width, 0,
                width / width, height / height,
                0, height / height
            ],
            texcoordLocation = gl.getAttribLocation(program, "a_texCoord");
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoordArray), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texcoordLocation);
        gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

        // 设置图像的大小
        var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
        gl.uniform2f(textureSizeLocation, image.width, image.height);

        // 创建纹理颜色数据
        // 染纹理时需要纹理坐标，而不是像素坐标。无论纹理是什么尺寸，纹理坐标范围始终是 0.0 到 1.0 。
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // 将图像上传到纹理，作为颜色数据使用
        // gl.TEXTURE_2D: 二维纹理贴图。
        // 0 级是基本图像等级
        // gl.RGBA: 从颜色缓冲区读取红色、绿色、蓝色和 alpha 组件。
        // gl.UNSIGNED_BYTE 指定纹理数据格式，gl.UNSIGNED_BYTE: gl.RGBA每个通道 8 位
        // image 作纹理的像素源
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        // 设置筛选器
        // 第一个参数指定了纹理坐标，上面是使用的2D纹理
        // 第二个参数是指定设置的坐标轴
        // 第三个参数是环绕方式
        // 纹理环绕方式
        // gl.REPEAT	重复纹理图像
        // gl.MIRRORED_REPEAT 和 gl.REPEAT 一样，每次图形是镜像放置的.
        // gl.CLAMP_TO_EDGE	纹理坐标会被约束在0-1之前，超出的部份会重复纹理坐标的边缘，产生一种边缘被拉伸的效果
        // gl.CLAMP_TO_BORDER	超出的坐标为用户指定的边缘颜色。
        // 如果用GL_CLAMP_TO_BORDER,还需要指定一个边缘颜色 texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, borderColor);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // 设置纹理数据，读取buffer第几个颜色数据存储单元
        var u_imageLoc = gl.getUniformLocation(program, "u_image");
        gl.uniform1i(u_imageLoc, 0);

        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }


}

