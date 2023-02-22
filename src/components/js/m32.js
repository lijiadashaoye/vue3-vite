
import webglUtils from '../file/webgl-utils'
import m4 from '../file/m4'
import primitives from '../file/primitives'
import imgs from '@/assets/8x8-font.png'
export default function (can) {
    let gl = can.getContext('webgl'),
        cwidth = can.offsetWidth,
        cheight = can.offsetHeight;
    gl.viewport(0, 0, cwidth, cheight); // 设置视图端口
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND); //开启混合 如果不开启 就会没有透明
    gl.depthMask(true); // 释放深度缓冲区，使之可读可写
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let vertCode1 = `
           attribute vec4 a_position;
           attribute vec4 a_color;
           uniform mat4 u_matrix;
           varying vec4 v_color;       
    
           void main() {
             gl_Position = u_matrix * a_position;       
             v_color = a_color;
           }`,
        fragCode1 = `
            precision mediump float;
            varying vec4 v_color;
            
            void main() {
               gl_FragColor = v_color;
            }`,
        vertCode2 = `
           attribute vec4 a_position;
           attribute vec2 a_texcoord;           

           uniform mat4 u_matrix;           
           varying vec2 v_texcoord;           

           void main() {
             gl_Position = u_matrix * a_position;           
             v_texcoord = a_texcoord;
           }`,
        fragCode2 = `
           precision mediump float;
            varying vec2 v_texcoord;
            
            uniform sampler2D u_texture;
            void main() {
               gl_FragColor = texture2D(u_texture, v_texcoord);
            }`;
    var fontInfo = {
        letterHeight: 8,
        spaceWidth: 8,
        spacing: -1,
        textureWidth: 64,
        textureHeight: 40,
        glyphInfos: {
            'a': { x: 0, y: 0, width: 8, },
            'b': { x: 8, y: 0, width: 8, },
            'c': { x: 16, y: 0, width: 8, },
            'd': { x: 24, y: 0, width: 8, },
            'e': { x: 32, y: 0, width: 8, },
            'f': { x: 40, y: 0, width: 8, },
            'g': { x: 48, y: 0, width: 8, },
            'h': { x: 56, y: 0, width: 8, },
            'i': { x: 0, y: 8, width: 8, },
            'j': { x: 8, y: 8, width: 8, },
            'k': { x: 16, y: 8, width: 8, },
            'l': { x: 24, y: 8, width: 8, },
            'm': { x: 32, y: 8, width: 8, },
            'n': { x: 40, y: 8, width: 8, },
            'o': { x: 48, y: 8, width: 8, },
            'p': { x: 56, y: 8, width: 8, },
            'q': { x: 0, y: 16, width: 8, },
            'r': { x: 8, y: 16, width: 8, },
            's': { x: 16, y: 16, width: 8, },
            't': { x: 24, y: 16, width: 8, },
            'u': { x: 32, y: 16, width: 8, },
            'v': { x: 40, y: 16, width: 8, },
            'w': { x: 48, y: 16, width: 8, },
            'x': { x: 56, y: 16, width: 8, },
            'y': { x: 0, y: 24, width: 8, },
            'z': { x: 8, y: 24, width: 8, },
            '0': { x: 16, y: 24, width: 8, },
            '1': { x: 24, y: 24, width: 8, },
            '2': { x: 32, y: 24, width: 8, },
            '3': { x: 40, y: 24, width: 8, },
            '4': { x: 48, y: 24, width: 8, },
            '5': { x: 56, y: 24, width: 8, },
            '6': { x: 0, y: 32, width: 8, },
            '7': { x: 8, y: 32, width: 8, },
            '8': { x: 16, y: 32, width: 8, },
            '9': { x: 24, y: 32, width: 8, },
            '-': { x: 32, y: 32, width: 8, },
            '*': { x: 40, y: 32, width: 8, },
            '!': { x: 48, y: 32, width: 8, },
            '?': { x: 56, y: 32, width: 8, },
        },
    };

    var fBufferInfo = primitives.create3DFBufferInfo(gl);
    var textBufferInfo = {
        attribs: {
            a_position: { buffer: gl.createBuffer(), numComponents: 2, },
            a_texcoord: { buffer: gl.createBuffer(), numComponents: 2, },
        },
        numElements: 0,
    };

    var fProgramInfo = webglUtils.createProgramInfo(gl, [vertCode1, fragCode1]);
    var textProgramInfo = webglUtils.createProgramInfo(gl, [vertCode2, fragCode2]);

    var glyphTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, glyphTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));

    var image = new Image();
    image.src = imgs;
    image.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_2D, glyphTex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    });

    var fUniforms = {
        u_matrix: m4.identity(),
    };

    var textUniforms = {
        u_matrix: m4.identity(),
        u_texture: glyphTex,
        u_color: [0, 0, 0, 1],  // black
    };
    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var translation = [0, 30, 0];
    var rotation = [degToRad(190), degToRad(0), degToRad(0)];
    var scale = [1, 1, 1];
    var rotationSpeed = 1.2;

    // 设置视图矩阵
    var fieldOfViewRadians = degToRad(60);
    var aspect = cwidth / cheight;
    var zNear = 1;
    var zFar = 2000;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    requestAnimationFrame(drawScene);
    var then = 0,
        names = "anxa";
    function drawScene(now) {
        now *= 0.0001;
        var deltaTime = now - then;
        then = now;
        rotation[1] += rotationSpeed * deltaTime;
        // 相机投影视图
        var cameraRadius = 360;
        var cameraPosition = [Math.cos(now) * cameraRadius, 0, Math.sin(now) * cameraRadius];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);
        var viewMatrix = m4.inverse(cameraMatrix);

        var textPositions = [];
        gl.useProgram(fProgramInfo.program);
        webglUtils.setBuffersAndAttributes(gl, fProgramInfo, fBufferInfo);
        // 设置变换矩阵
        var fViewMatrix = m4.translate(viewMatrix, translation[0], translation[1], translation[2]);
        fViewMatrix = m4.xRotate(fViewMatrix, rotation[0]);
        fViewMatrix = m4.yRotate(fViewMatrix, rotation[1]);
        fViewMatrix = m4.zRotate(fViewMatrix, rotation[2] + now);
        fViewMatrix = m4.scale(fViewMatrix, scale[0], scale[1], scale[2]);
        fViewMatrix = m4.translate(fViewMatrix, -50, -75, 0);
        textPositions.push([fViewMatrix[12], fViewMatrix[13], fViewMatrix[14]]);
        fUniforms.u_matrix = m4.multiply(projectionMatrix, fViewMatrix);
        webglUtils.setUniforms(fProgramInfo, fUniforms);
        gl.drawElements(gl.TRIANGLES, fBufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);

        gl.useProgram(textProgramInfo.program);
        webglUtils.setBuffersAndAttributes(gl, textProgramInfo, textBufferInfo);

        textPositions.forEach(function (pos) {
            var vertices = makeVerticesForString(fontInfo, names);

            textBufferInfo.attribs.a_position.numComponents = 2;
            gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo.attribs.a_position.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices.arrays.position, gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo.attribs.a_texcoord.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices.arrays.texcoord, gl.DYNAMIC_DRAW);

            var fromEye = m4.normalize(pos);
            var amountToMoveTowardEye = 150;
            var viewX = pos[0] - fromEye[0] * amountToMoveTowardEye;
            var viewY = pos[1] - fromEye[1] * amountToMoveTowardEye;
            var viewZ = pos[2] - fromEye[2] * amountToMoveTowardEye;
            var desiredTextScale = -1 / gl.canvas.height * 2;
            var scale = viewZ * desiredTextScale;

            var textMatrix = m4.translate(projectionMatrix, viewX, viewY, viewZ);
            textMatrix = m4.scale(textMatrix, scale, scale, 1);
            m4.copy(textMatrix, textUniforms.u_matrix);
            webglUtils.setUniforms(textProgramInfo, textUniforms);

            gl.drawArrays(gl.TRIANGLES, 0, vertices.numVertices);
        });

        requestAnimationFrame(drawScene);
    }
}

function makeVerticesForString(fontInfo, s) {
    var len = s.length;
    var numVertices = len * 6;
    var positions = new Float32Array(numVertices * 2);
    var texcoords = new Float32Array(numVertices * 2);
    var offset = 0;
    var x = 0;
    var maxX = fontInfo.textureWidth;
    var maxY = fontInfo.textureHeight;
    for (var ii = 0; ii < len; ++ii) {
        var letter = s[ii];
        var glyphInfo = fontInfo.glyphInfos[letter];
        if (glyphInfo) {
            var x2 = x + glyphInfo.width;
            var u1 = glyphInfo.x / maxX;
            var v1 = (glyphInfo.y + fontInfo.letterHeight - 1) / maxY;
            var u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX;
            var v2 = glyphInfo.y / maxY;

            positions[offset + 0] = x;
            positions[offset + 1] = 0;
            texcoords[offset + 0] = u1;
            texcoords[offset + 1] = v1;

            positions[offset + 2] = x2;
            positions[offset + 3] = 0;
            texcoords[offset + 2] = u2;
            texcoords[offset + 3] = v1;

            positions[offset + 4] = x;
            positions[offset + 5] = fontInfo.letterHeight;
            texcoords[offset + 4] = u1;
            texcoords[offset + 5] = v2;

            positions[offset + 6] = x;
            positions[offset + 7] = fontInfo.letterHeight;
            texcoords[offset + 6] = u1;
            texcoords[offset + 7] = v2;

            positions[offset + 8] = x2;
            positions[offset + 9] = 0;
            texcoords[offset + 8] = u2;
            texcoords[offset + 9] = v1;

            positions[offset + 10] = x2;
            positions[offset + 11] = fontInfo.letterHeight;
            texcoords[offset + 10] = u2;
            texcoords[offset + 11] = v2;

            x += glyphInfo.width + fontInfo.spacing;
            offset += 12;
        } else {
            x += fontInfo.spaceWidth;
        }
    }
    return {
        arrays: {
            position: new Float32Array(positions.buffer, 0, offset),
            texcoord: new Float32Array(texcoords.buffer, 0, offset),
        },
        numVertices: offset / 2,
    };
}