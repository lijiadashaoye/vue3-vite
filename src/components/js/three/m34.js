
import webglUtils from '../../file/webgl-utils'
import m4 from '../../file/m4'
import primitives from '../../file/primitives';
export default function (can) {
    let gl = can.getContext('webgl'),
        width = can.offsetWidth,
        height = can.offsetHeight;
    gl.viewport(0, 0, width, height); // 设置视图端口
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let vertexCode = `
            attribute vec4 a_position;
            attribute vec4 a_color;
            
            uniform mat4 u_matrix;
            
            varying vec4 v_color;
            
            void main() {
              gl_Position = u_matrix * a_position;
            
              v_color = a_color;
            }`,
        fragCode = `
            precision mediump float;
            varying vec4 v_color;
            
            uniform vec4 u_colorMult;
            
            void main() {
               gl_FragColor = v_color * u_colorMult;
            }`;
    const sphereBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 10, 12, 6);
    const cubeBufferInfo = primitives.createCubeWithVertexColorsBufferInfo(gl, 20);
    const coneBufferInfo = primitives.createTruncatedConeWithVertexColorsBufferInfo(gl, 10, 0, 20, 12, 1, true, false);

    var fieldOfViewRadians = 60 * Math.PI / 180
    var sphereUniforms = {
        u_colorMult: [0.5, 1, 0.5, 1],
        u_matrix: m4.identity(),
    };
    var cubeUniforms = {
        u_colorMult: [1, 0.5, 0.5, 1],
        u_matrix: m4.identity(),
    };
    var coneUniforms = {
        u_colorMult: [0.5, 0.5, 1, 1],
        u_matrix: m4.identity(),
    };
    var sphereTranslation = [0, 0, 0];
    var cubeTranslation = [-35, 0, 0];
    var coneTranslation = [40, 0, 0];
    // 物体的变换矩阵
    function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
        var matrix = m4.translate(viewProjectionMatrix,
            translation[0],
            translation[1],
            translation[2]);
        matrix = m4.xRotate(matrix, xRotation);
        return m4.yRotate(matrix, yRotation);
    }

    function drawScene(time) {
        time *= 0.0005;
        // 视图矩阵
        var aspect = width / height;
        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
        // 相机矩阵
        var cameraPosition = [0, 0, 60];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);
        // 相机矩阵的逆矩阵
        var viewMatrix = m4.inverse(cameraMatrix);
        // 物体相对相机的位置、变化矩阵
        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        var sphereXRotation = time;
        var sphereYRotation = time;
        var cubeXRotation = -time;
        var cubeYRotation = time;
        var coneXRotation = time;
        var coneYRotation = -time;

        var programInfo = webglUtils.createProgramInfo(gl, [vertexCode, fragCode]);

        // 画球体
        webglUtils.setBuffersAndAttributes(gl, programInfo, sphereBufferInfo);
        gl.useProgram(programInfo.program); // 着色器程序度一样，可以只写一个
        sphereUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            sphereTranslation,
            sphereXRotation,
            sphereYRotation);
        webglUtils.setUniforms(programInfo, sphereUniforms);
        gl.drawArrays(gl.TRIANGLES, 0, sphereBufferInfo.numElements);

        // 画立方体
        webglUtils.setBuffersAndAttributes(gl, programInfo, cubeBufferInfo);
        gl.useProgram(programInfo.program);
        cubeUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            cubeTranslation,
            cubeXRotation,
            cubeYRotation);
        webglUtils.setUniforms(programInfo, cubeUniforms);
        gl.drawArrays(gl.TRIANGLES, 0, cubeBufferInfo.numElements);

        // 画椎体
        webglUtils.setBuffersAndAttributes(gl, programInfo, coneBufferInfo);
        gl.useProgram(programInfo.program);
        coneUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            coneTranslation,
            coneXRotation,
            coneYRotation);
        webglUtils.setUniforms(programInfo, coneUniforms);
        gl.drawArrays(gl.TRIANGLES, 0, coneBufferInfo.numElements);

        requestAnimationFrame(drawScene);
    }
    requestAnimationFrame(drawScene);





}