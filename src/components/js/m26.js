import webglUtils from '../file/webgl-utils'
import m4 from '../file/m4'
import primitives from '../file/primitives'

export default function (can) {
    const gl = can.getContext('webgl'); // 获取webgl图形执行
    let width = can.clientWidth,
        height = can.clientHeight;
    can.addEventListener('webglcontextrestored', e => {
        console.log(e)
    })

    let texCode = `
        attribute vec4 a_position;
        attribute vec3 a_normal;
        attribute vec2 a_texcoord;
        
        uniform vec3 u_lightWorldPosition; // 灯光的世界坐标
        uniform vec3 u_viewWorldPosition;  // 相机的世界坐标

        uniform mat4 u_projection; // 世界坐标下的视图矩阵
        uniform mat4 u_view; // 相机视图的逆矩阵
        uniform mat4 u_world; // 物体的变换矩阵
        uniform mat4 u_textureMatrix; // 灯光的逆矩阵
        uniform mat4 u_transposeInverse; // 物体的转置求逆矩阵
        
        varying vec2 v_texcoord;
        varying vec4 v_projectedTexcoord;

        varying vec3 v_normal;
        varying vec3 v_surfaceToLight;
        varying vec3 v_surfaceToView;
        
        void main() {
          vec4 worldPosition = u_world * a_position;
          gl_Position = u_projection * u_view * worldPosition;
          v_texcoord = a_texcoord;
          // 物体在灯光投影视图中的坐标 
          v_projectedTexcoord = u_textureMatrix * worldPosition;

          // 法向量 * 物体的转置求逆矩阵，是为了在物体发生缩放变换时，法向量也可以保持正确的指向
          v_normal = mat3(u_transposeInverse) * a_normal;

          // 也可以不用转置求逆矩阵，但物体发生动态缩放时，法向量指向就会出问题；
          // v_normal = mat3(u_world) * a_normal;

          vec3 surfaceWorldPosition = (u_world * a_position).xyz;
          v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
          v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
        }`,
        fragCode = `
          precision mediump float;
          varying vec2 v_texcoord;
          varying vec4 v_projectedTexcoord;  // 物体在灯光投影视图中的坐标 

          varying vec3 v_normal;
          varying vec3 v_surfaceToLight;
          varying vec3 v_surfaceToView;
    
          uniform vec4 u_colorMult;
          uniform sampler2D u_texture; // 棋盘格纹理像素数据
          uniform sampler2D u_projectedTexture; // 深度纹理像素数据
          
          uniform float u_shininess;
          uniform vec3 u_lightDirection;
          uniform float u_innerLimit;         
          uniform float u_outerLimit;             
    
          void main() {
            vec3 normal = normalize(v_normal);
            vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
            vec3 surfaceToViewDirection = normalize(v_surfaceToView);

            // 光照方向和表面点到光源方向向量的cos值，从而用来判定是否在光照范围内
            float cos = dot(surfaceToLightDirection,-u_lightDirection);
            // 光照范围
            float isInLight = smoothstep(u_outerLimit,u_innerLimit,cos);
            // 计算光照范围内聚光灯的光照值
            float light = isInLight * dot(normal, surfaceToLightDirection);
            // 计算表面点与光照方向和视线这两个向量的夹角平分线
            vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
            // 计算反光强度，同时对光照强度求对数，降低反光高光的光照强度
            float specular = isInLight * pow(dot(normal, halfVector), u_shininess);

            // 获取灯光视角投影中的点的位置信息
            vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
            // 获取已经画过一次的，灯光视角的，当前像素的深度值z
            float hasDrawDepth = projectedTexcoord.z;  

            // 判断是否在灯光范围内
            bool inRange =
                projectedTexcoord.x >= 0.0 &&
                projectedTexcoord.x <= 1.0 &&
                projectedTexcoord.y >= 0.0 &&
                projectedTexcoord.y <= 1.0; 

            // 获取深度信息，'r' 通道内包含深度值
            float willDrawDepth = texture2D(u_projectedTexture, projectedTexcoord.xy).r;

            // willDrawDepth <= hasDrawDepth：解释，willDrawDepth是第二次画到画布时的像素深度值，hasDrawDepth是第一次画到帧缓存中的深度值
            // 如果 willDrawDepth 小于 hasDrawDepth ，则从光源视角来看，有某物更加接近光源，所以正在绘制的像素（willDrawDepth）位于阴影中。
            // 深度值的范围是 0.0（暗） 到 1.0（亮）
            float shadowLight = (inRange && willDrawDepth <= hasDrawDepth) ? 0.0 : 1.0;
            
            // 画相机视角的纹理
            vec4 texColor = texture2D(u_texture, v_texcoord) * u_colorMult;

            gl_FragColor = vec4(
                texColor.rgb * light * shadowLight +
                specular * shadowLight,
                texColor.a);
        }`,
        texCode1 = `
            attribute vec4 a_position;
      
            uniform mat4 u_projection;
            uniform mat4 u_view;
            uniform mat4 u_world;      
      
            void main() {
              gl_Position = u_projection * u_view * u_world * a_position;
        }`,
        fragCode1 = `
            precision mediump float;
      
            uniform vec4 u_color;
            void main() {
              gl_FragColor = u_color;
        }`;

    const textureProgramInfo = webglUtils.createProgramInfo(gl, [texCode, fragCode]);
    const colorProgramInfo = webglUtils.createProgramInfo(gl, [texCode1, fragCode1]);

    const sphereBufferInfo = primitives.createSphereBufferInfo(
        gl,
        1,  // radius
        32, // subdivisions around
        24, // subdivisions down
    );
    const planeBufferInfo = primitives.createPlaneBufferInfo(
        gl,
        20,  // width
        20,  // height
        1,   // subdivisions across
        1,   // subdivisions down
    );
    const cubeBufferInfo = primitives.createCubeBufferInfo(
        gl,
        2,  // size
    );
    const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
        position: [
            -1, -1, -1,
            1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
            -1, -1, 1,
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
        ],
        indices: [
            0, 1,
            1, 3,
            3, 2,
            2, 0,

            4, 5,
            5, 7,
            7, 6,
            6, 4,

            0, 4,
            1, 5,
            3, 7,
            2, 6,
        ],
    });

    // 棋盘格纹理，球和底部平面都使用这个纹理数据
    const checkerboardTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,                // mip level
        gl.LUMINANCE,     // internal format
        8,                // width
        8,                // height
        0,                // border
        gl.LUMINANCE,     // format
        gl.UNSIGNED_BYTE, // type
        new Uint8Array([  // data
            0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
            0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
            0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
            0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
            0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
            0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
            0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
            0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        ]));
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // 开启深度纹理扩展
    gl.getExtension('WEBGL_depth_texture')
    // 深度纹理像素数据
    const depthTexture = gl.createTexture();
    const depthTextureSize = 4000;
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,      // target：指定纹理的绑定对象
        0,                  // mip level：指定详细级别。0 级是基本图像等级
        gl.DEPTH_COMPONENT, // internal format：指定纹理中的颜色组件,gl.DEPTH_COMPONENT 只能用在深度纹理中
        depthTextureSize,   // width：指定纹理的宽度
        depthTextureSize,   // height：指定纹理的高度
        0,                  // border：指定纹理的边框宽度。必须为 0。
        gl.DEPTH_COMPONENT, // format：指定 texel 数据格式。它必须与 internal format
        gl.UNSIGNED_INT,    // type：指定 texel 数据的数据类型。UNSIGNED_INT 或 UNSIGNED_SHORT
        null); // data：绑定的数据，为null时，在着色器中 texture2D 被调用的时候，由于纹理没有正确设置，就会使用黑色作为纹理颜色数据

    // gl.UNSIGNED_BYTE,无符号字节，UInt8Array
    // gl.SHORT，短整形，Int16Array
    // gl.UNSIGNED_SHORT,无符号短整形，Uint16Array
    // gl.INT,整形，Int32Array
    // gl.UNSIGNED_INT, 无符号整形，Uint32Array
    // gl.FLOAT,浮点型，Float32Array

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // 创建一个帧缓冲，并写入深度纹理数据
    const depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,       // target：指定绑定点（目标）
        gl.DEPTH_ATTACHMENT,  // attachment point：指定纹理附着点
        gl.TEXTURE_2D,        // texture target：指定纹理目标
        depthTexture,         // texture：要附加其图像的 WebGLTexture 对象
        0);                   // level：指定要附加的纹理图像的mip-map级别。必须为0。

    // 兼容safari用
    const unusedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        depthTextureSize,
        depthTextureSize,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,        // target
        gl.COLOR_ATTACHMENT0,  // attachment point
        gl.TEXTURE_2D,         // texture target
        unusedTexture,         // texture
        0);

    function degToRad(d) {
        return d * Math.PI / 180;
    }
    let cameraX = 6,
        cameraY = 5,
        posX = 2.5,
        posY = 4.8,
        posZ = 4.3,
        targetX = 2.5,
        targetY = 0,
        targetZ = 3.5,
        projWidth = 1,
        projHeight = 1,
        fieldOfView = 120;

    let cameraXrange = document.getElementById('cameraX'),
        cameraXs = document.getElementById('cameraXs'),
        cameraYrange = document.getElementById('cameraY'),
        cameraYs = document.getElementById('cameraYs');
    cameraXrange.addEventListener('input', (e) => {
        let val = +e.target.value;
        cameraXs.innerHTML = val
        cameraX = val;
        render()
    })
    cameraYrange.addEventListener('input', (e) => {
        let val = +e.target.value;
        cameraYs.innerHTML = val
        cameraY = val;
        render()
    })
    // 求转置求逆矩阵
    function transposeInverse(mat) {
        return m4.transpose(m4.inverse(mat))
    }
    const fieldOfViewRadians = degToRad(60);
    // 棋盘格的
    const planeUniforms = {
        u_colorMult: [0.5, 0.5, 1, 1],  // lightblue
        u_color: [1, 0, 0, 1],
        u_texture: checkerboardTexture,
        u_world: m4.translation(0, 0, 0),
        u_transposeInverse: transposeInverse(m4.translation(0, 0, 0)),
    };
    // 球的
    const sphereUniforms = {
        u_colorMult: [1, 0.5, 0.5, 1],
        u_texture: checkerboardTexture,
        u_world: m4.translation(2, 3, 4),
        u_transposeInverse: transposeInverse(m4.translation(2, 3, 4)),
    };
    // 正方体的
    const cubeUniforms = {
        u_colorMult: [0.5, 1, 0.5, 1],  // lightgreen
        u_color: [0, 0, 1, 1],
        u_texture: checkerboardTexture,
        u_world: m4.translation(3, 1, 0),
        u_transposeInverse: transposeInverse(m4.translation(3, 1, 0)),
    };
    // 参数：视图矩阵，相机视角视图矩阵，变换矩阵、灯光视角投影视图、绘制的程序对象
    function drawScene(projectionMatrix, cameraMatrix, textureMatrix, lightWorldMatrix, programInfo) {
        // 从相机矩阵中创建一个视图矩阵
        const viewMatrix = m4.inverse(cameraMatrix);

        // 启用多边形偏移，用来解决计算机无法处理两个z值非常接近时无法判定哪个先后的情况
        gl.enable(gl.POLYGON_OFFSET_FILL)
        // 在绘制之前指定用来计算偏移量的参数:
        // polygonOffset(a,b)：偏移公式：m*a+b*n
        // m：顶点所在平面相对于观察者的视线角度
        // n：表示硬件能够区分两个z值之差的最小值
        gl.polygonOffset(1.0, 1.0)

        // 设置对于球体和平面都是一样的 uniforms
        // 注意：在着色器中，任何没有对应 uniform 的值都会被忽略。
        gl.useProgram(programInfo.program);
        webglUtils.setUniforms(programInfo, {
            u_view: viewMatrix,
            u_projection: projectionMatrix,
            u_textureMatrix: textureMatrix,
            u_projectedTexture: depthTexture,
            u_shininess: 150,
            u_innerLimit: Math.cos(degToRad(fieldOfView / 2 - 10)),
            u_outerLimit: Math.cos(degToRad(fieldOfView / 2)),
            u_lightDirection: lightWorldMatrix.slice(8, 11).map(v => -v),
            u_lightWorldPosition: [posX, posY, posZ],
            u_viewWorldPosition: cameraMatrix.slice(12, 15),
        });
        // 绘制球体
        webglUtils.setBuffersAndAttributes(gl, programInfo, sphereBufferInfo);
        webglUtils.setUniforms(programInfo, sphereUniforms);
        webglUtils.drawBufferInfo(gl, sphereBufferInfo);
        // 绘制立方体
        webglUtils.setBuffersAndAttributes(gl, programInfo, cubeBufferInfo);
        webglUtils.setUniforms(programInfo, cubeUniforms);
        webglUtils.drawBufferInfo(gl, cubeBufferInfo);
        // 绘制平面
        webglUtils.setBuffersAndAttributes(gl, programInfo, planeBufferInfo);
        webglUtils.setUniforms(programInfo, planeUniforms);
        webglUtils.drawBufferInfo(gl, planeBufferInfo);
    }

    function render() {
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        // 首先从光源的视角（光源与相机在同一个位置）绘制一次，从而产生深度层次

        // 设置灯光视图
        const lightProjectionMatrix = m4.perspective(
            degToRad(fieldOfView),
            projWidth / projHeight,
            0.4,
            8)
        // 创建灯光视角投影视图
        const lightWorldMatrix = m4.lookAt(
            [posX, posY, posZ], // 相机位置
            [targetX, targetY, targetZ], // 物体位置
            [0, 1, 0], // 正方向
        );

        // 物体的世界坐标下的变换矩阵
        let textureMatrix = m4.identity();
        textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);

        // 灯光视图中物体的变换
        textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
        // 灯光投影视图中的物体变换矩阵
        textureMatrix = m4.multiply(textureMatrix, m4.inverse(lightWorldMatrix));
        // 绘制到深度纹理
        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
        gl.viewport(0, 0, depthTextureSize, depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        drawScene(lightProjectionMatrix, lightWorldMatrix, textureMatrix, lightWorldMatrix, colorProgramInfo);

        // 再绘制场景到画布
        // 调用 gl.bindFramebuffer 设置为 null是告诉WebGL 你想在画布上绘制，而不是在帧缓冲上。
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // 设置相机视图矩阵
        const aspect = width / height;
        const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
        // 相机视角投影视图
        const cameraPosition = [cameraX, cameraY, 7];
        const target = [0.9, 0.9, 1.9];
        const up = [0, 1, 0];
        const cameraMatrix = m4.lookAt(cameraPosition, target, up);
        drawScene(projectionMatrix, cameraMatrix, textureMatrix, lightWorldMatrix, textureProgramInfo);

        // 绘制线框
        const viewMatrix = m4.inverse(cameraMatrix);
        gl.useProgram(colorProgramInfo.program);
        webglUtils.setBuffersAndAttributes(gl, colorProgramInfo, cubeLinesBufferInfo);
        const mat = m4.multiply(lightWorldMatrix, m4.inverse(lightProjectionMatrix));
        webglUtils.setUniforms(colorProgramInfo, {
            u_color: [0, 0, 0, 1],
            u_view: viewMatrix,
            u_projection: projectionMatrix,
            u_world: mat,
        });
        webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
    }
    render()
}
