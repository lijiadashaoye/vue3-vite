export default function m7(can) {
  let gl = can.getContext('webgl'),
    width = can.offsetWidth,
    height = can.offsetHeight;

  let vertexCode = `
      attribute vec2 a_position;
      uniform mat3 u_matrix;
      void main() {
          gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
      }`,
    fragCode = `
      precision mediump float;
      uniform vec4 u_color;
      void main() {
         gl_FragColor = u_color;
      }`,
    vertexShader = gl.createShader(gl.VERTEX_SHADER),
    fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader, vertexCode)
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(vertexShader)
  gl.compileShader(fragShader);

  let program = gl.createProgram();
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragShader)
  gl.linkProgram(program)
  gl.useProgram(program)

  var positionLocation = gl.getAttribLocation(program, "a_position");
  // 设置点着色器
  let positionBuffer = gl.createBuffer();
  let pointArray = [
    // 左竖
    0, 0,
    20, 0,
    0, 100,
    0, 100,
    20, 0,
    20, 100,
    // 上横
    20, 0,
    80, 0,
    20, 20,
    20, 20,
    80, 0,
    80, 20,
    // 中横
    20, 40,
    65, 40,
    20, 60,
    20, 60,
    65, 40,
    65, 60,
  ].map(t => t * 0.5)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointArray), gl.STATIC_DRAW);

  var colorLocation = gl.getUniformLocation(program, "u_color");
  var color = [Math.random(), Math.random(), Math.random(), 1];
  gl.uniform4fv(colorLocation, color);

  gl.viewport(0, 0, width, height); // 设置视图端口
  gl.clearColor(1, 1, 1, 1);

  var matrixLocation = gl.getUniformLocation(program, "u_matrix");
  let xx = document.getElementById('xx15'),
    yy = document.getElementById('yy15'),
    rr = document.getElementById('rr15'),
    ttx = document.getElementById('ttx15'),
    tty = document.getElementById('tty15'),
    xxS = document.getElementById('xxS15'),
    yyS = document.getElementById('yyS15'),
    rS = document.getElementById('rS15'),
    tSx = document.getElementById('tSx15'),
    tSy = document.getElementById('tSy15');

  var translationArr = [12.5, 25];
  var angleInRadians = 0;
  var scale = [1, 1];
  setPosition()

  xx.addEventListener('input', (e) => {
    let x = +e.target.value
    xxS.innerHTML = x
    translationArr[0] = x
    setPosition()
  })
  yy.addEventListener('input', (e) => {
    let y = +e.target.value
    yyS.innerHTML = y
    translationArr[1] = y
    setPosition()
  })
  rr.addEventListener('input', (e) => {
    let value = +e.target.value;
    rS.innerHTML = value;
    angleInRadians = value * Math.PI / 180
    setPosition()
  })
  ttx.addEventListener('input', (e) => {
    let val = +e.target.value
    tSx.innerHTML = val
    scale[0] = val
    setPosition()
  })
  tty.addEventListener('input', (e) => {
    let val = +e.target.value
    tSy.innerHTML = val
    scale[1] = val
    setPosition()
  })

  function setPosition() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var projectionMatrix = projection(gl.canvas.clientWidth, gl.canvas.clientHeight);  // 将坐标原点重设
    var translationMatrix = translation(translationArr[0], translationArr[1]); // 计算移动
    var rotationMatrix = rotation(angleInRadians); // 计算旋转
    var scaleMatrix = scaling(scale[0], scale[1]); // 计算缩放
    var moveOriginMatrix = translation(-12.5, -25); // 初始移动
    var matrix = multiply(projectionMatrix, translationMatrix); // 计算初始移动
    matrix = multiply(matrix, rotationMatrix);
    matrix = multiply(matrix, scaleMatrix);
    matrix = multiply(matrix, moveOriginMatrix);
    // 设置矩阵
    // 对象包含了要修改的 uniform attribute 位置
    // 指定是否转置矩阵。必须为 false
    // 矩阵数据
    gl.uniformMatrix3fv(matrixLocation, false, matrix);
    gl.drawArrays(gl.TRIANGLES, 0, pointArray.length / 2);
  }

  function translation(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  }
  function rotation(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c, -s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  }
  function scaling(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  };
  function multiply(a, b) {
    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a10 = a[3];
    var a11 = a[4];
    var a12 = a[5];
    var a20 = a[6];
    var a21 = a[7];
    var a22 = a[8];
    var b00 = b[0];
    var b01 = b[1];
    var b02 = b[2];
    var b10 = b[3];
    var b11 = b[4];
    var b12 = b[5];
    var b20 = b[6];
    var b21 = b[7];
    var b22 = b[8];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  }
  function projection(width, height) {
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
  }
}
