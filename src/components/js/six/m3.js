
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import WebGL from 'three/examples/jsm/capabilities/WebGL.js'
import mp3_1 from '../../../assets/music/audio.mp3';
import mp3_2 from '../../../assets/music/358232_j_s_song.mp3';
import mp3_3 from '../../../assets/music/Project_Utopia.mp3';

export default function (wap, THREE, title) {
    title.innerHTML = '音效盒子';
    let width = wap.offsetWidth,
        height = wap.offsetHeight;
    // WebGL兼容性检查
    if (!WebGL.isWebGLAvailable()) {
        alert('你的浏览器不支持WEBGL!');
    }

    // 创建场景
    let scene = new THREE.Scene();
    // 雾-指数，它可以在相机附近提供清晰的视野，且距离相机越远，雾的浓度随着指数增长越快。
    // FogExp2(雾的颜色，定义雾的密度将会增长多块，默认值是0.00025)
    scene.fog = new THREE.FogExp2(0x000000, 0.0025);

    // 创建相机
    let camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 25, 0);

    // 创建渲染
    let renderer = new THREE.WebGLRenderer();
    // 设置对数深度缓冲区，优化深度冲突问题
    renderer.logarithmicDepthBuffer = true
    renderer.setSize(width, height);
    renderer.setClearColor('gray', 0.05); //设置背景颜色
    // 获取你屏幕对应的设备像素比.devicePixelRatio告诉threejs,以免渲染模糊问题
    renderer.setPixelRatio(window.devicePixelRatio);
    // 是否执行抗锯齿。默认为false.
    renderer.antialias = true;
    // 定义渲染器的输出编码。默认为THREE.LinearEncoding
    renderer.outputEncoding = THREE.sRGBEncoding;
    wap.appendChild(renderer.domElement);

    let controls;
    let material1, material2, material3;
    let analyser1, analyser2, analyser3;
    let sound1, sound2, sound3, sound4;

    function makePage() {
        const listener = new THREE.AudioListener();
        camera.add(listener);

        // 平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0.5, 1).normalize();
        scene.add(directionalLight); //点光源添加到场景中

        // 球缓冲几何体
        const sphere = new THREE.SphereGeometry(20, 32, 32);

        // MeshPhongMaterial，一种用于具有镜面高光的光泽表面的材质。例如涂漆木材
        // flatShading，定义材质是否使用平面着色进行渲染。默认值为false。
        // shininess，高亮的程度，越高的值越闪亮。默认值为 30。
        material1 = new THREE.MeshPhongMaterial({ color: 0xffaa00, flatShading: true, shininess: 0 });
        material2 = new THREE.MeshPhongMaterial({ color: 0xff2200, flatShading: true, shininess: 0 });
        material3 = new THREE.MeshPhongMaterial({ color: 0x6622aa, flatShading: true, shininess: 0 });

        const mesh1 = new THREE.Mesh(sphere, material1);
        mesh1.position.set(-250, 30, 0);
        scene.add(mesh1);
        // 创建一个位置相关的音频对象.
        sound1 = new THREE.PositionalAudio(listener);
        const audioLoader1 = new THREE.AudioLoader();
        audioLoader1.load(mp3_1, function (buffer) {
            sound1.setBuffer(buffer);
            // 随着音频源远离听众，音量减小的参考距离，即音量减小开始生效的距离
            sound1.setRefDistance(10);
            sound1.play();
        });
        scene.add(sound1);

        const mesh2 = new THREE.Mesh(sphere, material1);
        mesh2.position.set(250, 30, 0);
        scene.add(mesh2);
        // 创建一个位置相关的音频对象.
        sound2 = new THREE.PositionalAudio(listener);
        const audioLoader2 = new THREE.AudioLoader();
        audioLoader2.load(mp3_2, function (buffer) {
            sound2.setBuffer(buffer);
            // 随着音频源远离听众，音量减小的参考距离，即音量减小开始生效的距离
            sound2.setRefDistance(10);
            sound2.play();
        });
        scene.add(sound2);

        const mesh3 = new THREE.Mesh(sphere, material3);
        mesh3.position.set(0, 30, - 250);
        scene.add(mesh3);
        sound3 = new THREE.PositionalAudio(listener);
        // 一个振荡器，它产生一个周期的波形信号（如正弦波）
        const oscillator = listener.context.createOscillator();
        // 决定 OscillatorNode 播放的声音的周期波形
        oscillator.type = 'sine';
        // 表示振荡的频率，setValueAtTime(value, startTime)可以在指定的时间更改频率
        oscillator.frequency.setValueAtTime(144, sound3.context.currentTime);
        oscillator.start(0);
        // 设置音频来源
        sound3.setNodeSource(oscillator);
        // 距离物体多远时声音开始减弱
        sound3.setRefDistance(10);
        sound3.setVolume(0.5);
        mesh3.add(sound3);

        // 音频的分析数据
        analyser1 = new THREE.AudioAnalyser(sound1, 32);
        analyser2 = new THREE.AudioAnalyser(sound2, 32);
        analyser3 = new THREE.AudioAnalyser(sound3, 32);

        // 创建一个位置相关的音频对象.
        sound4 = new THREE.PositionalAudio(listener);
        const audioLoader4 = new THREE.AudioLoader();
        audioLoader4.load(mp3_3, function (buffer) {
            sound4.setBuffer(buffer);
            // 随着音频源远离听众，音量减小的参考距离，即音量减小开始生效的距离
            sound4.setRefDistance(10);
            sound4.play();
        });
        scene.add(sound4);

        // 添加一个辅助网格地面，参数：行、列，行颜色、列颜色 -->这俩得一样
        const helper = new THREE.GridHelper(1000, 10, 0x444444, 0x444444);
        helper.position.y = 0;
        scene.add(helper);

        // 音频控制
        const SoundControls = function () {
            this.master = listener.getMasterVolume();
            this.sound1 = sound1.getVolume();
            this.sound2 = sound2.getVolume();
            this.sound3 = sound3.getVolume();
            this.sound4 = sound4.getVolume();
        };
        const gui = new GUI();
        const soundControls = new SoundControls();
        gui.add(soundControls, 'master').min(0.0).max(1.0).step(0.01).onChange(function () {
            listener.setMasterVolume(soundControls.master);
        });
        gui.add(soundControls, 'sound1').min(0.0).max(1.0).step(0.01).onChange(function () {
            listener.setMasterVolume(soundControls.sound1);
        });
        gui.add(soundControls, 'sound2').min(0.0).max(1.0).step(0.01).onChange(function () {
            listener.setMasterVolume(soundControls.sound2);
        });
        gui.add(soundControls, 'sound3').min(0.0).max(1.0).step(0.01).onChange(function () {
            listener.setMasterVolume(soundControls.sound3);
        });
        gui.add(soundControls, 'sound4').min(0.0).max(1.0).step(0.01).onChange(function () {
            listener.setMasterVolume(soundControls.sound4);
        });

        // 通过第一人称控件FirstPersonControls 可以实现使用键盘移动相机，使用鼠标控制视角
        controls = new FirstPersonControls(camera, renderer.domElement);
        controls.movementSpeed = 70; // 移动速度。默认为1。
        controls.lookSpeed = 0.05; // 环视速度。默认为0.005。
        controls.noFly = true;
        controls.lookVertical = false; // 是否能够垂直环视。默认为true。

        animate();
    }
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        controls.update(delta);

        // emissive：材质的放射（光）颜色，基本上是不受其他光照影响的固有颜色。默认为黑色。
        material1.emissive.b = analyser1.getAverageFrequency() / 256;
        material2.emissive.b = analyser2.getAverageFrequency() / 256;
        material3.emissive.b = analyser3.getAverageFrequency() / 256;

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
        resetColor(target);
        makePage()
    })

    document.getElementById('ul').addEventListener('click', (e) => {
        let text = e.target.innerText;
        if (text !== 'm3') {
            sound1 && sound1.stop();
            sound2 && sound2.stop();
            sound3 && sound3.stop();
            sound4 && sound4.stop();
        }
        window.location.reload()
    })
}