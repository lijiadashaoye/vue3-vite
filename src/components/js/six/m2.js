import mp3 from '../../../assets/music/audio.mp3';

export default function (wap, THREE, title, other) {
    title.innerHTML = '简单音频';
    let width = wap.offsetWidth,
        height = wap.offsetHeight;

    let scene = new THREE.Scene();
    let camera = new THREE.Camera();
    camera.lookAt(0, 0, 0)
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
    wap.appendChild(renderer.domElement);

    // 创建音频需要先由用户在网页里手动执行事件
    let mainPlay, audio, analyser, uniforms, listener, loader, mediaElement
    function makePage() {
        // 创建一个 AudioListener，表示在场景中所有的位置和非位置相关的音效
        listener = new THREE.AudioListener();
        audio = new THREE.Audio(listener);
        let fftSize = 128; // 控制显示音乐条的数量:64/2个
        if (other.radio == 1) {
            loader = new THREE.AudioLoader();
            loader.load(mp3, function (buffer) {
                audio.setBuffer(buffer);
                audio.setLoop(true); // 设置为循环播放，默认是false
                audio.setVolume(other.volume); // 设置音量
                mainPlay = audio;
                toDraw()
            });
        } else {
            // 使用js的Audio音频
            mediaElement = new Audio(mp3);
            mediaElement.volume = other.volume;
            mainPlay = mediaElement;
            audio.setMediaElementSource(mediaElement);
            toDraw()
        }

        function toDraw() {
            let format = (renderer.capabilities.isWebGL2) ? THREE.RedFormat : THREE.LuminanceFormat;

            // fftSize：2的幂次方最高为2048, 用来表示确定频域的FFT (傅立叶变换)大小
            analyser = new THREE.AudioAnalyser(audio, fftSize); // 音频的分析数据
            const data = analyser.getFrequencyData(); // 获取平均频率
            uniforms = {
                tAudioData: { value: new THREE.DataTexture(data, fftSize / 2, 1, format) },
                bg: { value: new THREE.Vector3(0.4, 0.6, 0.7) }, // 背景色
                color: { value: new THREE.Vector3(1, 1, 0.6) } // 音量条颜色
            };
            let vertexShader = `
            varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = vec4( position, 1.0 );
			}`;
            let fragShader = `
            uniform sampler2D tAudioData;
            uniform vec3 bg;
            uniform vec3 color;
            varying vec2 vUv;
            void main() {
                float f = texture2D( tAudioData, vec2( vUv.x, 0.0 ) ).r;
                float i = step( vUv.y, f ) * step( f - 0.0125, vUv.y );
                gl_FragColor = vec4( mix( bg, color, i ), 1.0 );
            }`
            const material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragShader
            });
            // 平面缓冲几何体
            const geometry = new THREE.PlaneGeometry(1.8, 1.6);
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            mainPlay.play();
            animate();
        }

        function animate() {
            requestAnimationFrame(animate);
            // 获取平均频率
            analyser.getFrequencyData();
            uniforms.tAudioData.value.needsUpdate = true;
            renderer.render(scene, camera);
        }
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

        if (!mainPlay) {
            makePage()
        } else {
            if (mainPlay.paused || !mainPlay.isPlaying) {
                mainPlay.play()
            }
        }
    })
    document.getElementById('暂停').addEventListener('click', (e) => {
        let target = e.target;
        resetColor(target)
        mainPlay.pause()
    })
    document.getElementById('继续').addEventListener('click', (e) => {
        let target = e.target;
        resetColor(target)
        mainPlay.play()
    })
    document.getElementById('结束').addEventListener('click', (e) => {
        let target = e.target;
        resetColor(target)
        mainPlay.stop()
        mainPlay = null
    })
    document.getElementById('重置').addEventListener('click', (e) => {
        let target = e.target;
        resetColor(target)
        mainPlay.stop().play()
    })
    document.getElementById('ul').addEventListener('click', (e) => {
        let text = e.target.innerText;
        if (text !== 'm2') {
            mainPlay && mainPlay.stop();
        }
        window.location.reload()
    })

    document.getElementById('只有声音').addEventListener('click', () => {
        onlySound()
    })

    function onlySound() {
        const listener = new THREE.AudioListener();
        // 创建一个全局 audio 源
        const sound = new THREE.Audio(listener);
        // 加载一个 sound 并将其设置为 Audio 对象的缓冲区
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(mp3, function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
        });
    }
}

