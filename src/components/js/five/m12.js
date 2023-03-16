
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = ''

    // 透视摄像机:PerspectiveCamera(视野角度,近截面/远截面)
    let camera = new THREE.PerspectiveCamera(6, width / height, 0.1, 100); // 投影视图
    camera.position.set(10, 10, 30);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshLambertMaterial({
        color: 0x00ffff,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);

    const geometry2 = new THREE.PlaneGeometry(3, 3);
    const material2 = new THREE.MeshLambertMaterial({
        color: 0xff6666,
        side: THREE.DoubleSide,
    });
    const mesh2 = new THREE.Mesh(geometry2, material2);
    // 尽量避免两个Mesh完全重合
    mesh2.position.z = 0.01;

    let scene = new THREE.Scene(); // 场景
    scene.add(mesh);
    scene.add(mesh2);

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
