import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = '漫反射材质+平行光+可视化平行光+GUI'

    let scene = new THREE.Scene(); // 场景
    const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
    // camera.position.set(292, 223, 185);
    //在原来相机位置基础上拉远，可以观察到更大的范围
    camera.position.set(400, 400, 400);
    camera.lookAt(0, 0, 0);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // 平行光
    // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
    directionalLight.position.set(80, 100, 50);
    // 方向光指向对象网格模型mesh，可以不设置，默认的位置是0,0,0
    // directionalLight.target = (0, 0, 0);
    scene.add(directionalLight);
    // DirectionalLightHelper：可视化平行光
    const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 2, 'yellow');
    scene.add(dirLightHelper);

    const geometry = new THREE.BoxGeometry(10, 10, 10);
    // 漫反射材质对象Material
    const material = new THREE.MeshLambertMaterial({
        color: 0x00ffff, //设置材质颜色
        transparent: true,//开启透明
        opacity: 0.5,//设置透明度
    });

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
            // 在XOZ平面上分布
            mesh.position.set(i * 30, -i * 5, j * 30);
            scene.add(mesh); //网格模型添加到场景中  
        }
    }

    let renderer = new THREE.WebGLRenderer(); // 渲染器
    renderer.setSize(width, height);
    canvas.appendChild(renderer.domElement);
    renderer.render(scene, camera);

    // 设置相机控件轨道控制器OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', function () {
        renderer.render(scene, camera); //执行渲染操作
    });//监听鼠标、键盘事件

    // 添加调试 GUI
    const gui = new GUI();
    gui.onChange((e) => {
        renderer.render(scene, camera);
        // console.log(e)
    })
    gui.domElement.style.right = '0px';
    gui.domElement.style.top = '120px';
    gui.domElement.style.width = '300px';
    gui.domElement.id = 'gui';

    // 创建材质子菜单
    // 关闭.close() 展开.open() 交互界面
    const matFolder = gui.addFolder('分组1').open();
    const matFolder1 = matFolder.addFolder('分组1-1').open();
    // gui交互界面不分组,只有一个默认的总的菜单。
    // add(控制对象，对象具体属性，其他参数)
    // 参数3、参数4数据类型：数字(拖动条)
    matFolder.add(directionalLight, 'intensity', 0, 1)
        .name('环境光强度')
        .step(0.01);
    // 参数3是一个数组，生成交互界面是下拉菜单
    matFolder.add(directionalLight, 'intensity', [0, 0.2, 0.4, 0.6, 0.8, 1])
        .name('环境光强度')
        .step(0.01);

    // 参数3是一个对象，生成交互界面是下拉菜单
    matFolder1.add(directionalLight, 'intensity', {
        two: 0.2,
        four: 0.4,
        six: 0.6,
        eight: 0.8,
        one: 1,
    })
        .name('环境光强度')
        .step(0.01);

}