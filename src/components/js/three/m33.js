
import webglUtils from '../../file/webgl-utils'
import m4 from '../../file/m4'
import primitives from '../../file/primitives';
export default function (can) {
    let gl = can.getContext('webgl'),
        cwidth = can.offsetWidth,
        cheight = can.offsetHeight;
    gl.viewport(0, 0, cwidth, cheight); // 设置视图端口
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND); //开启混合 如果不开启 就会没有透明
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
            uniform mat4 u_matrix;

            void main() {
              gl_Position = u_matrix * a_position;
            }`,
        fragCode2 = `
            precision mediump float;
            uniform vec4 u_color;
            void main() {
              gl_FragColor = u_color;
            }`;
    const vertexColorProgramInfo = webglUtils.createProgramInfo(gl, [vertCode1, fragCode1]);
    const solidColorProgramInfo = webglUtils.createProgramInfo(gl, [vertCode2, fragCode2]);
    const fBufferInfo = primitives.create3DFBufferInfo(gl);
    function createCameraBufferInfo(gl, scale = 1) {
        const positions = [
            -1, -1, 1,  // cube vertices
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
            -1, -1, 3,
            1, -1, 3,
            -1, 1, 3,
            1, 1, 3,
            0, 0, 1,  // cone tip
        ];
        const indices = [
            0, 1, 1, 3, 3, 2, 2, 0, // cube indices
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
        ];
        const numSegments = 6;
        const coneBaseIndex = positions.length / 3;
        const coneTipIndex = coneBaseIndex - 1;
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments;
            const angle = u * Math.PI * 2;
            const x = Math.cos(angle);
            const y = Math.sin(angle);
            positions.push(x, y, 0);

            indices.push(coneTipIndex, coneBaseIndex + i);
            indices.push(coneBaseIndex + i, coneBaseIndex + (i + 1) % numSegments);
        }
        positions.forEach((v, ndx) => {
            positions[ndx] *= scale;
        });
        return webglUtils.createBufferInfoFromArrays(gl, {
            position: positions,
            indices,
        });
    }
    function createClipspaceCubeBufferInfo(gl) {
        const positions = [
            -1, -1, -1,  // cube vertices
            1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
            -1, -1, 1,
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
        ];
        const indices = [
            0, 1, 1, 3, 3, 2, 2, 0, // cube indices
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
        ];
        return webglUtils.createBufferInfoFromArrays(gl, {
            position: positions,
            indices,
        });
    }

    const cameraScale = 20;
    const cameraBufferInfo = createCameraBufferInfo(gl, cameraScale);
    const clipspaceCubeBufferInfo = createClipspaceCubeBufferInfo(gl);

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    const settings = {
        rotation: 150,  // in degrees
        cam1FieldOfView: 60,  // in degrees
        cam1PosX: 0,
        cam1PosY: 0,
        cam1PosZ: -200,
        cam1Near: 80,
        cam1Far: 300,
    };

    function drawScene(projectionMatrix, cameraMatrix, worldMatrix) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const viewMatrix = m4.inverse(cameraMatrix);

        let mat = m4.multiply(projectionMatrix, viewMatrix);
        mat = m4.multiply(mat, worldMatrix);

        gl.useProgram(vertexColorProgramInfo.program);
        webglUtils.setBuffersAndAttributes(gl, vertexColorProgramInfo, fBufferInfo);

        webglUtils.setUniforms(vertexColorProgramInfo, {
            u_matrix: mat,
        });

        webglUtils.drawBufferInfo(gl, fBufferInfo);
    }

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.SCISSOR_TEST);
    const effectiveWidth = gl.canvas.clientWidth / 2;
    const aspect = effectiveWidth / gl.canvas.clientHeight;
    const near = 1;
    const far = 2000;

    const perspectiveProjectionMatrix = m4.perspective(degToRad(settings.cam1FieldOfView), aspect, settings.cam1Near,
        settings.cam1Far);
    const cameraPosition = [
        settings.cam1PosX,
        settings.cam1PosY,
        settings.cam1PosZ,
    ];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);

    let worldMatrix = m4.yRotation(degToRad(settings.rotation));
    worldMatrix = m4.xRotate(worldMatrix, degToRad(settings.rotation));
    worldMatrix = m4.translate(worldMatrix, -35, -75, -5);

    const { width, height } = gl.canvas;
    const leftWidth = width / 2 | 0;
    gl.viewport(0, 0, leftWidth, height);
    gl.scissor(0, 0, leftWidth, height);
    gl.clearColor(1, 0.8, 0.8, 1);
    drawScene(perspectiveProjectionMatrix, cameraMatrix, worldMatrix);

    const rightWidth = width - leftWidth;
    gl.viewport(leftWidth, 0, rightWidth, height);
    gl.scissor(leftWidth, 0, rightWidth, height);
    gl.clearColor(0.8, 0.8, 1, 1);

    const perspectiveProjectionMatrix2 =
        m4.perspective(degToRad(60), aspect, near, far);
    const cameraPosition2 = [-600, 400, -400];
    const target2 = [0, 0, 0];
    const cameraMatrix2 = m4.lookAt(cameraPosition2, target2, up);
    drawScene(perspectiveProjectionMatrix2, cameraMatrix2, worldMatrix);

    const viewMatrix = m4.inverse(cameraMatrix2);
    let mat = m4.multiply(perspectiveProjectionMatrix2, viewMatrix);
    mat = m4.multiply(mat, cameraMatrix);

    gl.useProgram(solidColorProgramInfo.program);
    webglUtils.setBuffersAndAttributes(gl, solidColorProgramInfo, cameraBufferInfo);
    webglUtils.setUniforms(solidColorProgramInfo, {
        u_matrix: mat,
        u_color: [0, 0, 0, 1],
    });
    webglUtils.drawBufferInfo(gl, cameraBufferInfo, gl.LINES);

    mat = m4.multiply(mat, m4.inverse(perspectiveProjectionMatrix));
    webglUtils.setBuffersAndAttributes(gl, solidColorProgramInfo, clipspaceCubeBufferInfo);

    webglUtils.setUniforms(solidColorProgramInfo, {
        u_matrix: mat,
        u_color: [0, 0, 0, 1],
    });

    webglUtils.drawBufferInfo(gl, clipspaceCubeBufferInfo, gl.LINES);

}