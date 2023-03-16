import m4 from '../../file/m4'
import webglUtils from '../../file/webgl-utils'
import primitives from '../../file/primitives'
import img from '@/assets/f.png'

export default function (can) {
    const gl = can.getContext('webgl'); // 获取webgl图形执行
    let width = can.clientWidth,
        height = can.clientHeight;
    gl.viewport(0, 0, width, height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let texCode1 = `
        attribute vec4 a_position; // 物体的世界坐标
        attribute vec2 a_texcoord; // 纹理坐标
        
        uniform mat4 u_projection; // 世界坐标下的视图矩阵
        uniform mat4 u_view; // 相机视图的逆矩阵
        uniform mat4 u_world; // 物体的变换矩阵
        uniform mat4 u_textureMatrix; // 线框的相机投影视图
        
        varying vec2 v_texcoord;
        varying vec4 v_projectedTexcoord;
        
        void main() {
          // 物体的世界坐标
          vec4 worldPosition = u_world * a_position;
          // 物体的相机投影视图空间内的坐标
          gl_Position = u_projection * u_view * worldPosition;

          v_texcoord = a_texcoord;
          // 物体在线框投影视图空间内的坐标
          v_projectedTexcoord = u_textureMatrix * worldPosition;
        }`,
        fragCode1 = `
        precision mediump float;
        
        varying vec2 v_texcoord; // 纹理坐标数据
        varying vec4 v_projectedTexcoord; // 物体在线框投影视图空间内的坐标
        
        uniform vec4 u_colorMult; // 纹理颜色
        uniform sampler2D u_texture;  // 棋盘格纹理数据
        uniform sampler2D u_projectedTexture; // 图片纹理数据
        
        void main() {
            // 除以 w 得到正确的投影视图位置，
            // 事实上WebGL会将我们提供给 gl_Position 的 x,y,z,w 值自动除以 w 
          vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
          // 判断是否在线框范围内 
          bool inRange = 
              projectedTexcoord.x >= 0.0 &&
              projectedTexcoord.x <= 1.0 &&
              projectedTexcoord.y >= 0.0 &&
              projectedTexcoord.y <= 1.0;

          // 线框内的面积画纹理
          vec4 projectedTexColor = texture2D(u_projectedTexture, projectedTexcoord.xy);
          // 画整个画布的纹理
          vec4 texColor = texture2D(u_texture, v_texcoord) * u_colorMult;
          // 如果在线框内，则画贴图纹理，在线框外，画棋盘格纹理
          gl_FragColor = inRange ? projectedTexColor : texColor;
        }`,
        texCode2 = `
          attribute vec4 a_position;

          uniform mat4 u_projection;
          uniform mat4 u_view;
          uniform mat4 u_world;
      
          void main() {
          gl_Position = u_projection * u_view * u_world * a_position;
        }`,
        fragCode2 = `
          precision mediump float;

          uniform vec4 u_color;
          void main() {
            gl_FragColor = u_color;
        }`;
    const textureProgramInfo = webglUtils.createProgramInfo(gl, [texCode1, fragCode1]);
    const colorProgramInfo = webglUtils.createProgramInfo(gl, [texCode2, fragCode2]);
    // 球
    const sphereBufferInfo = primitives.createSphereBufferInfo(
        gl,
        1,  // radius
        100, // subdivisions around
        900,  // subdivisions down
    );
    // 棋盘格
    const planeBufferInfo = primitives.createPlaneBufferInfo(
        gl,
        12,  // width
        12,  // height
        1,   // subdivisions across
        1,   // subdivisions down
    );
    // 线框
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
    // 棋盘格纹理数据
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

    // 贴图纹理数据
    const imageTexture = gl.createTexture();
    const image = new Image();
    image.src = img;
    image.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        drawScene();
    });

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    const settings = {
        cameraX: .8,
        cameraY: 5.9,
        posX: 2,
        posY: 5,
        posZ: 4.6,
        targetX: 2,
        targetY: 0.2,
        targetZ: 3.6,
        projWidth: 1,
        projHeight: 1,
        perspective: true,
        fieldOfView: 35,
    };

    const visualAngle = degToRad(60); // 视角
    // 棋盘格
    const planeUniforms = {
        u_colorMult: [0.5, 0.5, 1, 1],
        u_texture: checkerboardTexture,
        u_world: m4.translation(0, 0, 0),
    };
    // 球
    const sphereUniforms = {
        u_colorMult: [1, 0.5, 0.5, 1],  // pink
        u_texture: checkerboardTexture,
        u_world: m4.translation(2, 3, 4),
    };

    function drawScene() {
        // 世界坐标下的视图矩阵
        const aspect = width / height;
        const projectionMatrix = m4.perspective(visualAngle, aspect, 1, 2000);
        // 相机视图
        const cameraPosition = [settings.cameraX, settings.cameraY, 7];
        const target = [1, 0, 1.9];
        const up = [0, 1, 0];
        const cameraMatrix = m4.lookAt(cameraPosition, target, up);
        // 相机视图的逆矩阵，该矩阵会变换其他世界坐标为相对于这个空间的坐标
        const viewMatrix = m4.inverse(cameraMatrix);

        // 线框的视图矩阵
        const textureProjectionMatrix = m4.perspective(
            degToRad(settings.fieldOfView),
            settings.projWidth / settings.projHeight,
            0.1,  // near
            200)  // far
        // 线框的变换矩阵
        let textureMatrix = m4.identity();
        textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
        // 线框的投影视图
        textureMatrix = m4.multiply(textureMatrix, textureProjectionMatrix);
        // 线框的相机视图矩阵，该矩阵的逆矩阵会变换其他世界坐标为相对于这个空间的坐标
        const textureWorldMatrix = m4.lookAt(
            [settings.posX, settings.posY, settings.posZ],          // position
            [settings.targetX, settings.targetY, settings.targetZ], // target
            [0, 1, 0],                                              // up
        );
        // 线框的相机投影视图
        textureMatrix = m4.multiply(textureMatrix, m4.inverse(textureWorldMatrix));

        gl.useProgram(textureProgramInfo.program);
        webglUtils.setUniforms(textureProgramInfo, {
            u_view: viewMatrix,
            u_projection: projectionMatrix,
            u_textureMatrix: textureMatrix,
            u_projectedTexture: imageTexture,
        });
        webglUtils.setBuffersAndAttributes(gl, textureProgramInfo, sphereBufferInfo);
        webglUtils.setUniforms(textureProgramInfo, sphereUniforms);
        webglUtils.drawBufferInfo(gl, sphereBufferInfo);

        webglUtils.setBuffersAndAttributes(gl, textureProgramInfo, planeBufferInfo);
        webglUtils.setUniforms(textureProgramInfo, planeUniforms);
        webglUtils.drawBufferInfo(gl, planeBufferInfo);

        // 线框
        gl.useProgram(colorProgramInfo.program);
        webglUtils.setBuffersAndAttributes(gl, colorProgramInfo, cubeLinesBufferInfo);
        const mat = m4.multiply(textureWorldMatrix, m4.inverse(textureProjectionMatrix));
        webglUtils.setUniforms(colorProgramInfo, {
            u_color: [0, 0, 0, 1],
            u_view: viewMatrix,
            u_projection: projectionMatrix,
            u_world: mat,
        });
        webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
    }
}