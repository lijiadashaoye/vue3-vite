
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = 'CurvePath拼接曲线+管道TubeGeometry+旋转成型LatheGeometry+拉伸ExtrudeGeometry+扫描造型'

    // 透视摄像机:PerspectiveCamera(视野角度,近截面/远截面)
    let camera = new THREE.PerspectiveCamera(15, width / height, 0.1, 100); // 投影视图
    camera.position.set(0, 10, 30);

    const shape = new THREE.Shape();
    shape.moveTo(0, 0); // 定义起点
    shape.lineTo(4, 1); // 定义终点
    shape.lineTo(1.8, 2.4); // 定义终点
    shape.lineTo(1.2, 1.4); // 定义终点
    shape.lineTo(0.2, 1); // 定义终点
    const geometry = new THREE.ShapeGeometry(shape);

    const material = new THREE.MeshLambertMaterial({
        color: 'red',
        side: THREE.DoubleSide,//双面显示看到管道内壁
    });
    const Lathecurve = new THREE.Line(geometry, material); // 线条模型对象

    let scene = new THREE.Scene(); // 场景
    scene.add(Lathecurve)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 环境光
    const pointLight = new THREE.PointLight(0xffffff, 1); // 点光源
    pointLight.position.set(50, 50, 30);//点光源位置
    scene.add(pointLight); //点光源添加到场景中
    scene.add(ambientLight); //环境光:没有特定方向，整体改变场景的光照明暗

    // 渲染器
    let renderer = new THREE.WebGLRenderer();
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
