
// 通过相机控件OrbitControls实现旋转缩放预览效果,OrbitControls本质上就是改变相机的参数
// 旋转：拖动鼠标左键
// 缩放：滚动鼠标中键
// 平移：拖动鼠标右键
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// WebGL渲染性能查看库
import Stats from 'three/addons/libs/stats.module.js';
const stats = new Stats();
stats.domElement.style.cssText = 'position: fixed;top: 0px;right: 0px;cursor: pointer;opacity: 0.9;z-index: 10000;width: 200px;height: 100px;'
Array.from(stats.domElement.children).forEach(t => {
    t.style.cssText += 'width:100%;height:100%'
});
stats.domElement.id = "statsDomElement";
document.body.appendChild(stats.domElement);

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = '网格基础材质+webgl渲染性能监控+点光源+环境光+辅助观察的坐标系+相机轨道控制器'

    // 透视摄像机:PerspectiveCamera(视野角度,近截面/远截面)
    // 正投影相机:OrthographicCamera
    let camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100); // 投影视图
    camera.position.set(-2, 2, 55); // 相机位置
    camera.lookAt(0, 3, 0);
    // camera.updateProjectionMatrix(); // 更新相机和渲染的参数，一般用在canvas尺寸发生变化时

    let box = new THREE.BoxGeometry(8, 5, 10); // 立方体 x、y、z 三个方向的尺寸
    let material = new THREE.MeshBasicMaterial() // 网格基础材质，不受光照影响

    let scene = new THREE.Scene(); // 场景

    let mesh = new THREE.Mesh(box, material); // 网格模型
    mesh.position.set(0, 0, 0); // 设置模型位置
    // 通过.add()方法，把网格模型mesh添加到三维场景scene中，也可以用.remove()移除
    scene.add(mesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // 环境光
    const pointLight = new THREE.PointLight(0xffffff, 0.5); // 点光源
    pointLight.position.set(10, 5, 10);//点光源位置
    scene.add(pointLight); //点光源添加到场景中
    scene.add(ambientLight); //环境光:没有特定方向，整体改变场景的光照明暗

    // 光源辅助观察
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 2);
    scene.add(pointLightHelper);

    // 辅助观察的坐标系
    const axesHelper = new THREE.AxesHelper(15);
    scene.add(axesHelper);

    // 渲染器
    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    canvas.appendChild(renderer.domElement);

    // 设置相机轨道控制器OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', function () {
        renderer.render(scene, camera); //执行渲染操作
    });//监听鼠标、键盘事件

    renderer.setAnimationLoop(() => {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
        stats.update();
    });





}