
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function (canvas, THREE, title, type) {

    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = type;
    document.querySelector('.can').innerHTML = '';

    let scene = new THREE.Scene(); // 场景
    let geometry = '';
    if (type === '矩形平面几何体') {
        //矩形几何体PlaneGeometry的参数3,4表示细分数，默认是1,1
        geometry = new THREE.PlaneGeometry(20, 10, 2, 2); //矩形平面几何体
    }
    if (type === '长方体') {
        geometry = new THREE.BoxGeometry(10, 10, 20); //长方体

        // 几何体xyz三个方向都放大2倍
        geometry.scale(0.8, 0.8, 0.8)
            // 几何体沿着x轴平移50
            .translate(5, 0, 0)
            // 几何体绕着x轴旋转45度
            // 旋转.rotateX()、.rotateY()、.rotateZ()
            .rotateX(Math.PI / 4);

        // 居中：已经偏移的几何体居中，执行.center()，你可以看到几何体重新与坐标原点重合
        // geometry.center();
    }
    if (type === '球体') {
        // 参数2、3分别代表宽、高度两个方向上的细分数，默认32,16
        // 如果球体细分数比较低，表面就不会那么光滑。
        geometry = new THREE.SphereGeometry(10, 42, 26);
    }
    const material = new THREE.MeshLambertMaterial({
        color: 0x00ffff,
        wireframe: true,// 为true 表示以线条模式渲染mesh对应的三角形数据
    });
    let body = new THREE.Mesh(geometry, material);
    scene.add(body);


    let camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100); // 投影视图
    camera.position.set(-20, 10, 55); // 相机位置
    camera.lookAt(0, 3, 0);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // 平行光
    // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
    directionalLight.position.set(80, 100, 50);
    // 方向光指向对象网格模型mesh，可以不设置，默认的位置是0,0,0
    directionalLight.target = body;
    scene.add(directionalLight);

    // 辅助观察的坐标系
    const axesHelper = new THREE.AxesHelper(25);
    scene.add(axesHelper);

    // 渲染器
    let renderer = new THREE.WebGLRenderer({
        antialias: true, // 渲染器锯齿模糊
    });
    renderer.setSize(width, height);
    // 获取你屏幕对应的设备像素比.devicePixelRatio告诉threejs,以免渲染模糊问题
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor('white', 1); //设置背景颜色
    canvas.appendChild(renderer.domElement);

    // 设置相机控件轨道控制器OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', function () {
        renderer.render(scene, camera); //执行渲染操作
    });//监听鼠标、键盘事件

    renderer.render(scene, camera);
}
