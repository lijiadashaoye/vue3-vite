
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import png from '@/assets/2.png';

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = '加载图片纹理'

    // 透视摄像机:PerspectiveCamera(视野角度,近截面/远截面)
    let camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100); // 投影视图
    camera.position.set(10, 10, 30);

    let scene = new THREE.Scene(); // 场景

    const geometry = new THREE.PlaneGeometry(10, 10); // 矩形平面
    // const geometry = new THREE.BoxGeometry(8, 8, 8); //长方体
    // const geometry = new THREE.SphereGeometry(6, 25, 25); //球体
    // const geometry = new THREE.CircleGeometry(7, 5); // CircleGeometry(半径，边数) 按照圆形采样纹理贴图，边数>=3

    //纹理贴图加载器TextureLoader
    const texLoader = new THREE.TextureLoader();
    // .load()方法加载图像，返回一个纹理对象Texture，因为是异步加载图片，所以不会立即显示贴图
    // 可以选择用回调函数执行后边的代码
    texLoader.load(png, (texture) => {
        texture.offset.x += 0.2;//纹理U方向偏移
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        // uv两个方向纹理重复数量
        texture.repeat.set(3, 3);//注意选择合适的阵列数量

        //是否翻转纹理贴图
        // texture.flipY = false;

        // 纹理对象Texture颜色空间
        // texture.encoding = THREE.LinearEncoding; //默认值
        texture.encoding = THREE.sRGBEncoding; // 最好与下边的renderer保持一致
        // THREE.sRGBEncoding变量在threejs内部表示数字3001
        console.log('texture.encoding', texture.encoding);

        toRender(texture)
    });

    function toRender(e) {
        // 默认 uv和默认 position是一一对应的，此例中：左上、右上、左下、右下
        // let arrr = [
        //     0, 1, // 图片左上角
        //     1, 1, // 图片右上角
        //     0, 0, // 图片左下角
        //     1, 0  // 图片右下角
        // ]

        // 自定义顶点UV
        // const uvs = new Float32Array([
        //     0, 0.4,
        //     0.4, 0.4,
        //     0, 0,
        //     0.4, 0,
        // ]);
        // // 设置几何体attributes属性的位置normal属性
        // geometry.attributes.uv = new THREE.BufferAttribute(uvs, 2); //2个为一组,表示一个顶点的纹理坐标

        const material = new THREE.MeshLambertMaterial({
            // 设置纹理贴图：Texture对象作为材质map属性的属性值
            map: e,//map表示材质的颜色贴图属性
            transparent: true, // 使用背景透明的png贴图，注意开启透明计算
        });
        // 也可以通过颜色贴图属性.map直接设置纹理贴图，和材质的参数设置一样。
        // material.map = texture;
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 环境光
        const pointLight = new THREE.PointLight(0xffffff, 1); // 点光源
        pointLight.position.set(50, 50, 30);//点光源位置
        scene.add(pointLight); //点光源添加到场景中
        scene.add(ambientLight); //环境光:没有特定方向，整体改变场景的光照明暗

        // 可视化mesh的局部坐标系
        const meshAxesHelper = new THREE.AxesHelper(10);
        scene.add(meshAxesHelper);

        // 添加一个辅助网格地面，参数：行、列，行颜色、列颜色 -->这俩得一样
        const gridHelper = new THREE.GridHelper(20, 15, 'red', 'red');
        scene.add(gridHelper);

        let renderer = new THREE.WebGLRenderer(); // 渲染器
        renderer.setSize(width, height);
        renderer.setClearColor('blue', 0.2); //设置背景颜色
        renderer.outputEncoding = THREE.sRGBEncoding;
        canvas.appendChild(renderer.domElement);

        // 设置相机轨道控制器OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.addEventListener('change', function () {
            renderer.render(scene, camera); //执行渲染操作
        });//监听鼠标、键盘事件

        // 渲染方法一定要放到最后
        renderer.render(scene, camera);


    }
}
