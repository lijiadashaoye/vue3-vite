
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function (wap, THREE, title) {
    title.innerHTML = '简单动画';
    let width = wap.offsetWidth,
        height = wap.offsetHeight;

    // 创建场景
    let scene = new THREE.Scene();
    // 创建相机
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(5, 2, 8);

    // 创建渲染
    const renderer = new THREE.WebGLRenderer();
    // 设置对数深度缓冲区，优化深度冲突问题
    renderer.logarithmicDepthBuffer = true
    // 是否执行抗锯齿。默认为false
    renderer.antialias = true;
    // 定义渲染器的输出编码。默认为THREE.LinearEncoding
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setSize(width, height);
    renderer.setClearColor('gray', 0.05); //设置背景颜色
    // 获取你屏幕对应的设备像素比.devicePixelRatio告诉threejs,以免渲染模糊问题
    renderer.setPixelRatio(window.devicePixelRatio);
    wap.appendChild(renderer.domElement);

    // canvas宽高比发生变动，需要更新相机的矩阵
    window.onresize = () => {
        let width = wap.offsetWidth,
            height = wap.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix(); // 更新摄像机投影矩阵。在任何参数被改变以后必须被调用。
        renderer.setSize(width, height); // 将输出canvas的大小调整为(width, height)并考虑设备像素比
        renderer.render(scene, camera); //执行渲染操作
    }

    // 辅助观察的坐标系
    const axesHelper = new THREE.AxesHelper(160);
    scene.add(axesHelper);

    // 设置相机轨道控制器OrbitControls
    // 本质上就是在改变透视投影相机PerspectiveCamera 的位置 .position
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    // 设置为false以禁用平移
    controls.enablePan = false;
    //设置为true以启用阻尼（惯性）
    //如果启用了阻尼，则必须在动画循环中调用 controls.update()
    controls.enableDamping = true;
    controls.update();
    controls.addEventListener('change', function () {
        renderer.render(scene, camera); //执行渲染操作
    });

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    // 用Draco库压缩的几何图形加载器。
    const dracoLoader = new DRACOLoader();
    // 设置loader路径，解压压缩模型
    dracoLoader.setDecoderPath('draco/');
    // 导入GLTF格式的loader
    const loader = new GLTFLoader();
    //设置DRACOloader
    loader.setDRACOLoader(dracoLoader);
    let mixer, animationAction;
    loader.load('LittlestTokyo.glb', function (gltf) {
        // console.log(gltf)
        const model = gltf.scene;
        model.position.set(1, 1, 0);
        model.scale.set(0.01, 0.01, 0.01);
        scene.add(model);

        // 动画混合器，是用于场景中特定对象的动画的播放器。参数：混合器播放的动画所属的对象scene
        // 当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器。
        mixer = new THREE.AnimationMixer(model);
        // 第一个参数可以是动画剪辑(AnimationClip)对象或者动画剪辑的名称
        animationAction = mixer.clipAction(gltf.animations[0]);
        // animationAction.repetitions = 2 // 设置整个动作过程动画剪辑（AnimationClip）执行的次数
        // animationAction.loop = THREE.LoopOnce; // 只执行一次
        // animationAction.loop = THREE.LoopPingPong; // 像乒乓球一样在起始点与结束点之间来回循环

        // 动画剪辑（AnimationClip）是一个可重用的关键帧轨道集，它代表动画。
        // let clip = animationAction.getClip();  // 动画剪辑
        // console.log(clip.duration) // 获取整个动画完整执行一次所需时间，秒
        // console.log(animationAction.time) // 获取整个动画开始时的时间，秒

        animationAction.play();
        animate();
    })
    // 创建一个时钟对象
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);

        // 获取自 clock.oldTime (默认值是 0) 设置后到当前的秒数
        const delta = clock.getDelta();
        // 推进混合器时间并更新动画
        mixer.update(delta);

        controls.update();
        renderer.render(scene, camera);
    }

    function resetColor(target) {
        Array.from(target.parentElement.children).forEach(li => {
            li.style.color = ''
        });
        target.style.color = 'red';
    }
    document.getElementById('开始').addEventListener('click', (e) => {
        let target = e.target;
        resetColor(target)
        // 判断动画是否正在执行
        if (!animationAction.isRunning()) {
            animationAction.play()
        }
    })
    document.getElementById('暂停').addEventListener('click', (e) => {
        let target = e.target;
        resetColor(target)
        animationAction.paused = true;
    })
    document.getElementById('继续').addEventListener('click', (e) => {
        let target = e.target;
        resetColor(target)
        animationAction.paused = false;
    })
    document.getElementById('结束').addEventListener('click', (e) => {
        let target = e.target;
        resetColor(target)
        // 停用混合器上所有预定的动作
        // mixer.stopAllAction()

        // 动作会马上停止以及完全重置
        animationAction.stop()
    })
    document.getElementById('重置').addEventListener('click', (e) => {
        let target = e.target;
        resetColor(target)
        animationAction.reset()
    })
}