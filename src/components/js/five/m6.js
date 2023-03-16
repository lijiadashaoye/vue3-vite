
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function (canvas, THREE, title, type) {

    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = 'Buffer的使用+画线';
    document.querySelector('.can').innerHTML = '';

    let scene = new THREE.Scene(); // 场景

    let geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array([
        -10, 0, 0, // 0
        10, 0, 0, // 1
        0, 10, 0, // 2
        0, 0, 5, // 3
        0, 10, 5, // 4
        0, 0, 15 // 5
    ]);
    // 设置几何体attributes属性的位置属性
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    let material = '', body = '';
    switch (type) {
        case "Mesh":
            // 使用网格模型：Mesh 网格模型创建的物体是由一个个小三角形组成
            material = new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide });
            body = new THREE.Mesh(geometry, material);
            break;
        case "Points":
            // 使用点模型，Points 模型创建的物体是由一个个点构成
            material = new THREE.PointsMaterial({ color: 0x00ff00, size: 5 })
            body = new THREE.Points(geometry, material);
            break;
        case "Line":
            // 使用线模型，Line 模型创建的物体是连续的线条，这些线可以理解为是按顺序把所有点连接起来。
            material = new THREE.LineBasicMaterial({ color: 'blue' })
            // 连续线条
            body = new THREE.Line(geometry, material);
            break;
        case "LineLoop":
            material = new THREE.LineBasicMaterial({ color: 'red' })
            // 闭合线条
            body = new THREE.LineLoop(geometry, material);
            break;
        case "LineSegments":
            material = new THREE.LineBasicMaterial({ color: 'black' })
            //非连续的线条
            body = new THREE.LineSegments(geometry, material);
            break;
        case "Index":
            vertices = new Float32Array([
                -10, -10, 0, //顶点1坐标
                10, -8, 0, //顶点2坐标
                10, 10, 0, //顶点3坐标
                -6, 10, 0, //顶点4坐标
            ]);
            let indexes = new Uint16Array([
                // 下面索引值对应顶点位置数据中的顶点坐标
                0, 1, 2, 0, 2, 3,
            ])
            // geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.attributes.position = new THREE.BufferAttribute(vertices, 3);
            geometry.index = new THREE.BufferAttribute(indexes, 1); //1个为一组
            material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            body = new THREE.LineLoop(geometry, material);
            break;
    }
    scene.add(body);

    let camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100); // 投影视图
    camera.position.set(-20, 10, 55); // 相机位置
    camera.lookAt(0, 3, 0);

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // 平行光
    // // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
    // directionalLight.position.set(80, 100, 50);
    // // 方向光指向对象网格模型mesh，可以不设置，默认的位置是0,0,0
    // directionalLight.target = body;
    // scene.add(directionalLight);

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
