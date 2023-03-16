
// 通过相机控件OrbitControls实现旋转缩放预览效果,OrbitControls本质上就是改变相机的参数
// 旋转：拖动鼠标左键
// 缩放：滚动鼠标中键
// 平移：拖动鼠标右键
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = '高光'

    let camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100); // 投影视图
    camera.position.set(-2, 2, 55); // 相机位置
    camera.lookAt(0, 3, 0);

    let scene = new THREE.Scene(); // 场景

    let box = new THREE.SphereGeometry(6); // 球体(半径)
    let material = new THREE.MeshPhongMaterial({  // 高光反射材质
        color: 'red',
        shininess: 10, //高光部分的亮度，默认30
        specular: 'yellow', // 高光部分的颜色
        // wireframe: true, // 以网格线形式显示
        transparent: true,//开启透明
        // side: THREE.DoubleSide //双面可见
    });
    material.opacity = 0.8; //设置透明度

    let mesh = new THREE.Mesh(box, material); // 网格模型
    mesh.position.set(0, 0, 0); // 模型位置
    // 通过.add()方法，把网格模型mesh添加到三维场景scene中
    scene.add(mesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // 环境光
    scene.add(ambientLight); //环境光:没有特定方向，整体改变场景的光照明暗

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // 平行光
    // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
    directionalLight.position.set(80, 100, 50);
    // 方向光指向对象网格模型mesh，可以不设置，默认的位置是0,0,0
    directionalLight.target = mesh;
    scene.add(directionalLight);

    // 辅助观察的坐标系
    const axesHelper = new THREE.AxesHelper(15);
    scene.add(axesHelper);

    let renderer = new THREE.WebGLRenderer({
        antialias: true, // 渲染器锯齿模糊
    }); // 渲染器
    renderer.setSize(width, height);
    // 获取你屏幕对应的设备像素比.devicePixelRatio告诉threejs,以免渲染模糊问题
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor('white');
    canvas.appendChild(renderer.domElement);

    // 设置相机控件轨道控制器OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', function () {
        renderer.render(scene, camera); //执行渲染操作
    });//监听鼠标、键盘事件

    renderer.render(scene, camera);
}
