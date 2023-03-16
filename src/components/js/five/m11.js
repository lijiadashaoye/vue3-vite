
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import pos_x from '@/assets/pos-x.jpg'
import neg_x from '@/assets/neg-x.jpg'
import pos_y from '@/assets/pos-y.jpg'
import neg_y from '@/assets/neg-x.jpg'
import pos_z from '@/assets/pos-z1.jpg'
import neg_z from '@/assets/neg-z.jpg'

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = ''

    // 透视摄像机:PerspectiveCamera(视野角度,近截面/远截面)
    let camera = new THREE.PerspectiveCamera(4, width / height, 0.1, 100); // 投影视图
    camera.position.set(10, 10, 30);

    let geometry = new THREE.BoxGeometry(1, 1, 1); // BoxGeometry（立方体）对象
    // CubeTextureLoader加载环境贴图
    new THREE.CubeTextureLoader()
        .load([pos_x, neg_x, pos_y, neg_y, pos_z, neg_z], (texture) => {
            // 纹理和渲染器颜色空间一致
            texture.encoding = THREE.sRGBEncoding;
            afterLoadImg(texture)
        });

    function afterLoadImg(textureCube) {
        let material = new THREE.MeshStandardMaterial({
            // 表示材质像金属的程度, 非金属材料,如木材或石材,使用0.0,金属使用1.0。
            metalness: 1.0,
            // 表面粗糙度，0.0表示平滑的镜面反射,1.0表示完全漫反射,默认0.5
            roughness: 1.0,
            envMap: textureCube, //设置环境贴图
            // 控制环境贴图对mesh表面影响程度，默认值1, 设置为0.0,相当于没有环境贴图
            envMapIntensity: 1.0
        })
        let mesh = new THREE.Mesh(geometry, material); // 网格物体

        let scene = new THREE.Scene(); // 场景
        scene.background = textureCube;
        scene.environment = textureCube;
        scene.add(mesh);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 环境光
        const pointLight = new THREE.PointLight(0xffffff, 1); // 点光源
        pointLight.position.set(50, 50, 30);//点光源位置
        scene.add(pointLight); //点光源添加到场景中
        scene.add(ambientLight); //环境光:没有特定方向，整体改变场景的光照明暗

        let renderer = new THREE.WebGLRenderer(); // 渲染器
        renderer.setSize(width, height);
        renderer.setClearColor('blue', 0.1); //设置背景颜色
        //解决加载gltf格式模型纹理贴图渲染结果颜色偏差不一样问题
        renderer.outputEncoding = THREE.sRGBEncoding;
        // 设置canvas样式
        // renderer.domElement.style.top = '0px';
        canvas.appendChild(renderer.domElement);

        // 设置相机轨道控制器OrbitControls
        // 本质上就是在改变透视投影相机PerspectiveCamera 的位置 .position
        const controls = new OrbitControls(camera, renderer.domElement);

        controls.addEventListener('change', function () {
            renderer.render(scene, camera); //执行渲染操作
        });

        // 渲染方法一定要放到最后
        renderer.render(scene, camera);
    }
}
