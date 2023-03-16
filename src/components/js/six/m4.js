
import mp3 from '../../../assets/music/ping_pong.mp3';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function (wap, THREE, title) {
    title.innerHTML = '位置相关的音频对象1';
    let width = wap.offsetWidth,
        height = wap.offsetHeight;
    let objects = []; // 存储球的数据
    let clock, renderer, scene, camera,
        sound1, sound2, sound3, sound4;

    function makePage() {
        // 创建场景
        scene = new THREE.Scene();

        clock = new THREE.Clock();
        // 创建相机
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(7, 3, 7);

        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
        scene.add(ambientLight);

        // 添加平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(0, 5, 5);
        scene.add(directionalLight);

        const d = 5;
        directionalLight.castShadow = true; // 如果设置为 true 该平行光会产生动态阴影
        // 在光的世界里。这用于生成场景的深度图
        directionalLight.shadow.camera.left = - d;// 摄像机视锥体左侧面 
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = - d;
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 20;
        // mapSize：一个Vector2,定义阴影贴图的宽度和高度，数值越大，阴影越清晰
        directionalLight.shadow.mapSize.x = 2048;
        directionalLight.shadow.mapSize.y = 2048;

        const audioLoader = new THREE.AudioLoader();
        const listener = new THREE.AudioListener();
        camera.add(listener);

        // 创建渲染
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.shadowMap.enabled = true;
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000); //设置背景颜色
        // 获取你屏幕对应的设备像素比.devicePixelRatio告诉threejs,以免渲染模糊问题
        renderer.setPixelRatio(window.devicePixelRatio);
        wap.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 1; // 你能够将相机向内移动多少（仅适用于PerspectiveCamera），其默认值为0。
        controls.maxDistance = 25; // 你能够将相机向外移动多少（仅适用于PerspectiveCamera），其默认值为Infinity。
        // 你能够垂直旋转的角度的上限，范围是0到Math.PI，其默认值为Math.PI。0度时，表示与-y轴平行，垂直X轴，指向+y轴
        controls.maxPolarAngle = Math.PI / 180 * 89;
        // 你能够垂直旋转的角度的下限，范围是0到Math.PI，其默认值为0，表示与+y轴平行，垂直X轴，指向-y轴
        controls.minPolarAngle = 0;
        controls.maxZoom = 1; // 你能够将相机缩小多少（仅适用于OrthographicCamera），其默认值为Infinity。
        controls.minZoom = 4; // 你能够将相机放大多少（仅适用于OrthographicCamera），其默认值为0。

        // 平面缓冲几何体
        const floorGeometry = new THREE.PlaneGeometry(10, 10);
        // 一种非光泽表面的材质，没有镜面高光。
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x4676b6 });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = Math.PI * - 0.5;
        floor.receiveShadow = true;
        scene.add(floor);

        // 球缓冲几何体
        const ballGeometry = new THREE.SphereGeometry(0.3, 32, 16);
        ballGeometry.translate(0, 0.3, 0);
        const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });

        const count = 3; // 控制球的数量
        const radius = 3; // 控制球的半径

        audioLoader.load(mp3, function (buffer) {
            for (let i = 0; i < count; i++) {
                const s = i / count * Math.PI * 2; // 弧度计算

                const ball = new THREE.Mesh(ballGeometry, ballMaterial);
                ball.castShadow = true;
                ball.userData.down = false;

                ball.position.x = radius * Math.cos(s) + 1;
                ball.position.z = radius * Math.sin(s) + 1.5;

                const audio = new THREE.PositionalAudio(listener);
                audio.setBuffer(buffer);
                ball.add(audio);

                scene.add(ball);
                objects.push(ball);
            }
            animate();
        });

    }

    function animate() {
        requestAnimationFrame(animate);

        let time = clock.getElapsedTime();
        let speed = 2;
        let height = 3;
        let offset = 0.1;
        for (let i = 0; i < objects.length; i++) {
            let ball = objects[i];
            let previousHeight = ball.position.y;
            ball.position.y = Math.abs(Math.sin(i * offset + (time * speed)) * height);

            if (ball.position.y < previousHeight) {
                ball.userData.down = true;
            } else {
                if (ball.userData.down === true) {
                    let audio = ball.children[0];
                    audio.play();
                    ball.userData.down = false;
                }
            }
        }
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