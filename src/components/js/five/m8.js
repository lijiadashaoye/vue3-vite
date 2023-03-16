
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = '层级结构'

    // 透视摄像机:PerspectiveCamera(视野角度,近截面/远截面)
    let camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100); // 投影视图
    camera.position.set(10, 10, 30);

    let scene = new THREE.Scene(); // 场景

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshLambertMaterial();
    // 构建层级模型的中间层一般都是通过Group类来完成
    const group = new THREE.Group();

    // 组命名
    group.name = '组一';

    // Object3D和Group等效，都可作为mesh1和mesh2的父对象
    // const obj = new THREE.Object3D();
    // obj.add(mesh1,mesh2);

    const mesh1 = new THREE.Mesh(geometry, material);
    const mesh2 = new THREE.Mesh(geometry, material);
    // 模型命名
    mesh2.name = '模型';
    mesh2.translateX(3);
    //把模型插入到组group中，作为group的子对象
    group.add(mesh1);
    group.add(mesh2);
    // .add()方法可以单独插入一个对象，也可以同时插入多个子对象。
    // group.add(mesh1, mesh2);

    //threejs默认mesh也可以添加子对象,mesh基类也是Object3D
    // mesh1.add(mesh2);

    //把group插入到场景中作为场景子对象
    scene.add(group);
    // console.log(group)

    // 层级模型的递归遍历
    // scene.traverse(function (obj) {
    //     console.log(obj)
    // })
    // 查找某个具体的模型
    // console.log(scene.getObjectByName('模型'))

    // mesh的世界坐标就是mesh.position与group.position的累加
    // 任何一个模型的本地坐标(局部坐标:相对父级坐标)就是模型的.position属性。
    group.position.set(0, 0, 0);
    mesh1.position.set(0, 0, 0);
    group.position.x += 1;
    console.log(group.position)
    console.log(mesh1.position)
    // 获取世界坐标
    // 一个模型的世界坐标，说的是，模型自身.position和所有父对象.position累加的坐标。
    const worldPosition = new THREE.Vector3();
    console.log(mesh1.getWorldPosition(worldPosition))

    // 父对象旋转缩放平移变换，子对象跟着变化
    // 沿着Y轴平移Group，mesh1和mesh2跟着平移
    // 也可使用.translateX()、.translateY()、.translateZ() 分别设置 position，
    group.translateY(1);
    //父对象缩放，子对象跟着缩放
    group.scale.set(1, 1, 1);
    //父对象旋转，子对象跟着旋转
    group.rotateY(Math.PI / 3);

    // 平移几何体的顶点坐标,改变几何体自身相对局部坐标原点的位置
    // geometry模型没有translateX()、geometry.position.y 等方法，只能用 translate()
    geometry.translate(0, 2, 0);

    // 可视化mesh的局部坐标系
    const meshAxesHelper = new THREE.AxesHelper(10);
    const meshAxesHelper1 = new THREE.AxesHelper(10);
    meshAxesHelper1.material.color = {
        r: 0,
        g: 0,
        b: 0,
    }
    mesh1.add(meshAxesHelper);
    scene.add(meshAxesHelper1);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // 平行光
    // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
    directionalLight.position.set(80, 100, 50);
    // 方向光指向对象网格模型mesh，可以不设置，默认的位置是0,0,0
    // directionalLight.target = (0, 0, 0);
    scene.add(directionalLight);

    let renderer = new THREE.WebGLRenderer(); // 渲染器
    renderer.setSize(width, height);
    renderer.setClearColor('blue', 0.2); //设置背景颜色
    canvas.appendChild(renderer.domElement);

    // 设置相机轨道控制器OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    // controls.addEventListener('change', function () {
    //     renderer.render(scene, camera); //执行渲染操作
    // });//监听鼠标、键盘事件
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const v2 = new THREE.Vector2(width, height);
    const outlinePass = new OutlinePass(v2, scene, camera);
    outlinePass.selectedObjects = [mesh1];
    //模型描边颜色，默认白色         
    outlinePass.visibleEdgeColor.set('red');
    //高亮发光描边厚度
    outlinePass.edgeThickness = 0.2;
    //高亮描边发光强度
    outlinePass.edgeStrength = 0.2;
    //模型闪烁频率控制，默认0不闪烁
    outlinePass.pulsePeriod = 1;

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height));
    bloomPass.strength = 0.2;

    const glitchPass = new GlitchPass();
    // 设置glitchPass通道
    composer.addPass(glitchPass);

    composer.render();

    controls.addEventListener('change', function () {
        composer.render();
    });//监听鼠标、键盘事件

    // setTimeout(() => {
    //     // 隐藏一个网格模型，.visible的默认值是true，可以隐藏任何（mesh、group）
    //     mesh2.visible = false;
    //     // 如果多个模型引用了同一个材质，如果该材质.visible设置为false，意味着隐藏绑定该材质的所有模型。
    //     // mesh2.material.visible =false;
    //     renderer.render(scene, camera);
    // }, 3000)

    // 渲染方法一定要放到最后
    // renderer.render(scene, camera);




}