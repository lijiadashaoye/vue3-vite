export default function m1(can) {

  const gl = can.getContext('webgl');
  // 我们必须使用JavaScript数组手动存储这些顶点，并使用顶点缓冲区将它们传递给WebGL渲染管道。
  var vertices = [
    0.4, 0.5,
    0.5, -0.5,
    -0.5, -0.5
  ];
  var vertShader = gl.createShader(gl.VERTEX_SHADER); // 创建顶点着色器
  var vertCode =
    `attribute vec2 ff; 
         void main() {
           gl_Position = vec4(ff, 0.2, 1.0);
         }`;
  gl.shaderSource(vertShader, vertCode); // 将着色器代码附加到着色器
  gl.compileShader(vertShader); // 编译程序

  // 片段着色器代码，为每个像素附颜色时运行的代码
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER); // 创建片段着色器
  var fragCode = `void main() { gl_FragColor = vec4(0.1, 0.0, 0.0, 0.1);}`;
  gl.shaderSource(fragShader, fragCode); // 将着色器代码附加到着色器
  gl.compileShader(fragShader); // 编译程序

  // 创建一个程序对象
  var shaderProgram = gl.createProgram();
  // 附加着色器
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  // 链接着色器
  gl.linkProgram(shaderProgram);
  // 使用程序
  gl.useProgram(shaderProgram);

  // 用两坐标画平面图
  var vertex_buffer = gl.createBuffer(); // 创建一个空的缓冲区
  let data = new Float32Array(vertices);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); // 传递数据到缓冲区

  var coord = gl.getAttribLocation(shaderProgram, "ff"); // 获取属性位置
  // 开启从缓冲中获取数据，激活顶点着色器属性以访问顶点着色器中的缓冲区对象
  gl.enableVertexAttribArray(coord);
  // 在渲染的时候告诉WebGL怎么从缓冲中获取数据传递给属性
  // coord 数据位置 - 它指定属性变量的存储位置
  // 2 大小 - 它指定缓冲区对象中每个顶点使用的坐标值个数（1 - 4）
  // gl.FLOAT 类型 - 它指定数据的类型。
  // false 归一化 - 这是一个布尔值。如果传递false就解读原数据类型，如果为真，则将非float数据归一化为[0，1]; 否则，它被归一化为[-1,1]。
  // 0 - 它指定不同顶点数据元素之间的字节数(画一个点所用到的所有顶点数据的大小)，或默认步幅为零。
  // 0 偏移量 - 指定每次读取的数据组中的偏移量（以字节为单位），以指示顶点数据存储的字节
  let size = data.BYTES_PER_ELEMENT;// 获取每一个数据所占的字节数
  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, size * 2, 0); // 将属性指向VBO

  gl.viewport(0, 0, can.offsetWidth, can.offsetHeight); // 设置视图端口
  gl.clearColor(0.5, 0.5, 0.5, 1);
  gl.clear(gl.COLOR_BUFFER_BIT); // 清除色彩缓冲位
  // gl.TRIANGLES 模式 - 在WebGL中，使用原始类型绘制模型
  // 0 启用数组中的起始元素
  // 3 此选项指定呈现时顶点着色器将运行的次数。
  gl.drawArrays(gl.TRIANGLES, 0, 3);

}