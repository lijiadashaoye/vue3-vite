export default function (can, type) {
    let gl = can.getContext('webgl')
    let width = can.width, height = can.height;

    let verCode = `
        attribute vec2 point;
        void main(){
            gl_Position=vec4(point,0.0,1.0);
        }`,
        fragCode = `void main(){gl_FragColor=vec4(0.1,0.2,0.3,1);}`,
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

    gl.viewport(0, 0, width, height);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let pointArray = [];
    let pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    if (type === 'LINES' || type === 'LINE_STRIP' || type === 'LINE_LOOP' || type === 'TRIANGLE_STRIP') {
        pointArray = [
            -0.4, 0.4,
            0.4, 0.4,
            -0.4, -0.4,
            0.5, -0.5,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointArray), gl.STATIC_DRAW);
        let point = gl.getAttribLocation(program, 'point');
        gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(point);

        switch (type) {
            case 'LINES': gl.drawArrays(gl.LINES, 0, pointArray.length / 2); break;
            case 'LINE_STRIP': gl.drawArrays(gl.LINE_STRIP, 0, pointArray.length / 2); break;
            case 'LINE_LOOP': gl.drawArrays(gl.LINE_LOOP, 0, pointArray.length / 2); break;
            case 'TRIANGLE_STRIP': gl.drawArrays(gl.TRIANGLE_STRIP, 0, pointArray.length / 2); break;
        }
    }
    if (type === 'TRIANGLES') {
        pointArray = [
            -0.4, 0.4,
            0.4, 0.4,
            -0.4, -0.4,
            -0.4, -0.4,
            0.4, 0.4,
            0.4, -0.4
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointArray), gl.STATIC_DRAW);
        let point = gl.getAttribLocation(program, 'point');
        gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(point);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, pointArray.length / 2)
    }
    if (type === 'TRIANGLE_FAN') {
        pointArray = [
            0.6, -0.8,
            -0.6, -0.5,
            -0.8, -0.1,
            -0.7, 0.1,
            -0.6, 0.2,
            -0.4, 0.3,
            -0.5, 0.8,
            -0.1, 0.4
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointArray), gl.STATIC_DRAW);
        let point = gl.getAttribLocation(program, 'point');
        gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(point);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, pointArray.length / 2);
    }
}
