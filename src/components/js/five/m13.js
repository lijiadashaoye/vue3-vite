
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = '自定义顶点坐标生成集合体+圆弧线上的顶点坐标，并最后绘制一个圆弧效果'

    // 透视摄像机:PerspectiveCamera(视野角度,近截面/远截面)
    let camera = new THREE.PerspectiveCamera(6, width / height, 0.1, 100); // 投影视图
    camera.position.set(10, 10, 30);

    const R = 1.2; //圆弧半径
    const N = 10; //分段数量
    const sp = 2 * Math.PI / N;//两个相邻点间隔弧度
    // 批量生成圆弧上的顶点数据
    const arr = [];
    for (let i = 0; i < N; i++) {
        const angle = sp * i;//当前点弧度
        // 以坐标原点为中心，在XOY平面上生成圆弧上的顶点数据
        const x = R * Math.cos(angle);
        const y = R * Math.sin(angle);
        arr.push(x, y, 0);
    }
    // 创建属性缓冲区对象，3个为一组，表示一个顶点的xyz坐标
    const positions = new THREE.BufferAttribute(new Float32Array(arr), 3);
    const geometry = new THREE.BufferGeometry(); //创建一个几何体对象
    // 设置几何体attributes属性的位置属性
    geometry.attributes.position = positions;

    // 线材质
    const material = new THREE.LineBasicMaterial({
        color: 'red' //线条颜色
    });
    // 创建线模型对象   构造函数：Line、LineLoop、LineSegments
    // const line = new THREE.Line(geometry, material); 
    const line = new THREE.Line(geometry, material); // 线条模型对象

    let scene = new THREE.Scene(); // 场景
    scene.add(line);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 环境光
    const pointLight = new THREE.PointLight(0xffffff, 1); // 点光源
    pointLight.position.set(50, 50, 30);//点光源位置
    scene.add(pointLight); //点光源添加到场景中
    scene.add(ambientLight); //环境光:没有特定方向，整体改变场景的光照明暗

    // 渲染器
    let renderer = new THREE.WebGLRenderer({
        // 设置对数深度缓冲区，优化深度冲突问题
        // 当两个面间隙过小，或者重合，你设置webgl渲染器对数深度缓冲区也是无效的。
        logarithmicDepthBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setClearColor('blue', 0.1); //设置背景颜色

    //解决加载gltf格式模型纹理贴图渲染结果颜色偏差不一样问题
    renderer.outputEncoding = THREE.sRGBEncoding;
    canvas.appendChild(renderer.domElement);

    // 设置相机轨道控制器OrbitControls
    // 本质上就是在改变透视投影相机PerspectiveCamera 的位置 .position
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.addEventListener('change', function () {
        renderer.render(scene, camera); //执行渲染操作
    });

    // 渲染方法一定要放到最后
    renderer.render(scene, camera);
}
