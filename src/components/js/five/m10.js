
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = '使用GLTFLoader加载.gltf文件'

    // 透视摄像机:PerspectiveCamera(视野角度,近截面/远截面)
    let camera = new THREE.PerspectiveCamera(4, width / height, 0.1, 100); // 投影视图
    camera.position.set(10, 10, 30);
    // 设置了lookAt，则也要同步 OrbitControls.target
    let target = [0, 0, 0.1]
    camera.lookAt(...target);

    let scene = new THREE.Scene(); // 场景

    new RGBELoader()
        .load('/glTF/royal_esplanade_1k.hdr', function (texture) {
            texture.mapping = width

            //是否翻转纹理贴图
            // texture.flipY = true;

            scene.background = texture;
            scene.environment = texture;

            // .load(模型路径,加载完成函数,加载过程progress函数)
            new GLTFLoader()
                // .setPath('publick/glTF/')
                .load('/glTF/DamagedHelmet.gltf', (gltf) => {
                    toRender(gltf)
                    // console.log('场景3D模型树结构', gltf);

                    // 翻转属性
                    const mesh = gltf.scene.children[0];
                    // console.log('.flipY', mesh.material.map.flipY);

                });
        });

    function toRender(gltf) {
        // 返回的场景对象gltf.scene插入到threejs场景中
        scene.add(gltf.scene);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 环境光
        const pointLight = new THREE.PointLight(0xffffff, 1); // 点光源
        pointLight.position.set(50, 50, 30);//点光源位置
        scene.add(pointLight); //点光源添加到场景中
        scene.add(ambientLight); //环境光:没有特定方向，整体改变场景的光照明暗

        let renderer = new THREE.WebGLRenderer(); // 渲染器
        renderer.setSize(width, height);
        renderer.setClearColor('blue', 0.2); //设置背景颜色
        //解决加载gltf格式模型纹理贴图渲染结果颜色偏差不一样问题
        renderer.outputEncoding = THREE.sRGBEncoding;
        canvas.appendChild(renderer.domElement);

        // 设置相机轨道控制器OrbitControls
        // 本质上就是在改变透视投影相机PerspectiveCamera 的位置 .position
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(...target);
        controls.update();
        controls.addEventListener('change', function () {
            // 可以用来查看相机坐标，拷贝数据反过来设置相机初始化位置，从而设置加载后怎么展示
            // console.log(camera.position)

            renderer.render(scene, camera); //执行渲染操作
        });

        // // 通过鼠标点击动态指定lookAt参数
        // canvas.addEventListener('mousedown', function (e) {
        //     let x = e.offsetX / e.target.offsetWidth * 10,
        //         y = e.offsetY / e.target.offsetHeight * 10,
        //         z = controls.target.z;
        //     controls.target.set(x, y, z); //与lookAt参数保持一致
        //     controls.update(); //update()函数内会执行camera.lookAt(controls.target)
        //     renderer.render(scene, camera); //执行渲染操作
        // });
        // // 通过鼠标点击动态指定lookAt参数
        // canvas.addEventListener('mouseup', function (e) {
        //     controls.target.set(0, 0, 0); //与lookAt参数保持一致
        //     controls.update(); //update()函数内会执行camera.lookAt(controls.target)
        //     renderer.render(scene, camera); //执行渲染操作
        // });

        // 渲染方法一定要放到最后
        renderer.render(scene, camera);
    }



}
