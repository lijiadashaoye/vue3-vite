export default function m7(can) {
  let gl = can.getContext('webgl');
  var vertices = [
    -0.5, 0.5, 0.0, 0.0,
    -0.5, -0.5, 0.0, 0.0,
    0.5, -0.5, 0.0, 0.0,
  ];
  // 1、你可以创建缓冲：createBuffer
  // 2、将数据存入缓冲：bindBuffer --> bufferData 
  // 3、在着色器中定义变量：attribute
  // 4、然后初始化的时候，在你制作的（着色）程序中找到属性所在地址：getAttribLocation 
  // 5、在渲染的时候告诉WebGL怎么从缓冲中获取数据传递给属性：enableVertexAttribArray --> vertexAttribPointer
  var vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // 每个顶点调用一次（顶点）着色器，每次调用都需要设置一个特殊的全局变量 gl_Position， 该变量的值就是裁减空间坐标值。
  var vertCode = `
        attribute vec4 coordinates;
        uniform vec4 translation;
        void main(void) {
          gl_Position = coordinates + translation;
        }`
  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);

  // 每个像素都将调用一次片段着色器，每次调用需要从你设置的特殊全局变量 gl_FragColor 中获取颜色信息。
  var fragCode = `
        precision mediump float;
        void main(void) {
           gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
        }`;
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  var coordinatesVar = gl.getAttribLocation(shaderProgram, "coordinates");
  gl.enableVertexAttribArray(coordinatesVar);
  gl.vertexAttribPointer(coordinatesVar, 4, gl.FLOAT, false, 0, 0);

  // 要注意的是全局变量属于单个着色程序，如果多个着色程序有同名全局变量，需要找到每个全局变量并设置自己的值。 
  // 我们调用gl.uniform()的时候只是设置了当前程序的全局变量
  /* 
    vec2, vec3和 vec4分别代表两个值，三个值和四个值的数组， 
    mat2, mat3 和 mat4 分别代表 2x2, 3x3 和 4x4 矩阵
    一个mat4和使用4个vec4变量是一致的
    同理，一个mat3和使用3个vec3变量是一致的，一个mat2和使用2个vec2变量是一致的

    vec3 column1 = vec3(1.0,2.0,3.0);
    vec3 column2 = vec3(1.0,3.0,2.0);
    vec3 column3 = vec3(0.0,2.0,1.0);
    mat3 M = mat3(column1,column2,column3);

    vec2 column1 = vec2(1.0,2.0);
    vec2 column2 = vec2(1.0,3.0);
    vec3 column3 = vec(0.0,2.0);
    mat3 M = mat3(column1,3.0,
                  column2,2.0,
                  column3,1.0);
    矩阵元素的访问:
    float value = mat[1][1]; // 获取第一列第一行的元素值
    数组可以定义为有大小的，或者没有大小的
    float color[3]; // 有三个浮点数据的color数组
    数组的遍历
    for(int i=0;i<color.length();++i){
       float value = color[i];
    }

    相互之间可以进行计算
    vec4 a = vec4(1, 2, 3, 4);
    vec4 b = a * 2.0;
    b 现在是 vec4(2, 4, 6, 8);
  */
  var translation = gl.getUniformLocation(shaderProgram, "translation");
  var Tx = 0.5, Ty = 0.2, Tz = 0.0;
  gl.uniform4f(translation, Tx, Ty, Tz, 1.0);

  gl.clearColor(0.5, 0.5, 0.5, 0.9);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, can.offsetWidth, can.offsetHeight); // 设置视图端口
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
 /*
// 旋转矩阵
var radian = Math.PI * ANGLE / 180.0;
var cosB = Math.cos(radian);
var sinB = Math.sin(radian);

var xformMatrix = new Float32Array([
cosB,  sinB, 0.0, 0.0,
-sinB, cosB, 0.0, 0.0,
0.0,   0.0,  1.0, 0.0,
0.0,   0.0,  0.0, 1.0
])

// 平移矩阵
var Tx = 0.5,Ty = 0.5,Tz = 0.5;
var xformMatrix = new Float32Array([
1.0, 0.0, 0.0, 0.0,
0.0, 1.0, 0.0, 0.0,
0.0, 0.0, 1.0, 0.0,
Tx,  Ty,  Tz,  1.0
])

// 缩放矩阵
var Sx = 1.0, Sy = 1.5, Sz = 1.0;
var xformMatrix = new Float32Array([
Sx,  0.0, 0.0, 0.0,
0.0, Sy,  0.0, 0.0,
0.0, 0.0, Sz,  0.0,
0.0, 0.0, 0.0, 1.0
])
*/
