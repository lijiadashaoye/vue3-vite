
export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = '普通正方体+设置背景颜色+透明度+双面可见'

    // 透视摄像机:PerspectiveCamera(视野角度,近截面/远截面)
    let camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100); // 投影视图
    camera.position.set(0, 0, 5);

    let geometry = new THREE.BoxGeometry(1, 1, 1); // BoxGeometry（立方体）对象
    let material = new THREE.MeshNormalMaterial({ // 不受光照影响的材质
        transparent: true, //开启透明
        opacity: 0.6,//设置透明度
        side: THREE.DoubleSide, //两面可见
        // side: THREE.FrontSide, //默认只有正面可见
    });
    let mesh = new THREE.Mesh(geometry, material); // 网格物体

    let scene = new THREE.Scene(); // 场景
    scene.add(mesh);

    // 渲染器
    let renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true, // 设置canvas元素是否可以保存为图片
    });
    renderer.setSize(width, height);
    renderer.setClearColor('blue', 0.2); // 设置背景颜色，第二个参数设置透明度，不需要可以不写
    // renderer.setClearAlpha(0.2);// 只设置背景透明度
    canvas.appendChild(renderer.domElement);

    renderer.setAnimationLoop(() => {
        // 也可以使用 .rotateX()、.rotateY()、.rotateZ() 分别设置
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        mesh.rotation.z += 0.01;

        // 网格模型绕向量表示的轴进行旋转
        // const axis = new THREE.Vector3(0, 1, 2);//向量axis
        // mesh.rotateOnAxis(axis, Math.PI / 360);//绕axis轴旋转π/8

        renderer.render(scene, camera);
    });
    // 保存为图片
    // document.addEventListener('click', function () {
    //     // 创建一个超链接元素，用来下载保存数据的文件
    //     const link = document.createElement('a');
    //     // 通过超链接herf属性，设置要保存到文件中的数据
    //     const canvas = renderer.domElement; //获取canvas对象
    //     link.href = canvas.toDataURL("image/png");
    //     link.download = 'threejs.png'; //下载文件名
    //     link.click(); //js代码触发超链接元素a的鼠标点击事件，开始下载文件到本地
    // })

    ///////////////////////////////////////////////////////////////////////////////////////////
    const point = new THREE.Vector3(1, 2, 3);
    // 克隆.clone()简单说就是复制一个和原对象一样的新 对象，对象的深拷贝
    const v2 = point.clone();
    v2.y = 9;
    console.log('point', point);
    console.log('v2', v2);

    // 复制.copy()简单说就是把一个对象属性的 属性值 赋值给另一个对象，对象的深拷贝
    const v1 = new THREE.Vector3(1, 2, 3);
    const v3 = new THREE.Vector3(4, 5, 6);
    //读取v1.x、v1.y、v1.z的赋值给v3.x、v3.y、v3.z
    v3.copy(v1);
    v3.y = 7;
    console.log(v1)
    console.log(v3)

    // 如果通过克隆.clone()获得的模型是对象的深拷贝
    // 但mesh的material是浅拷贝的，改变一个mesh的material，其他mesh也会跟着改变
    const mesh2 = mesh.clone();
    mesh.position.x = 0.1;
    console.log(mesh.position)
    console.log(mesh2.position)

    mesh2.material.opacity = 0.4;//设置透明度
    console.log(mesh.material.opacity)
    console.log(mesh2.material.opacity)

    // 若单独把material、rotation、position用.clone()拷贝，就会是深拷贝
    let material2 = mesh.material.clone(),
        rotation2 = mesh.rotation.clone(),
        position2 = mesh.position.clone();

    material2.opacity = 0.2;//设置透明度
    rotation2.x = 0.2;
    position2.x = 0.2;

    console.log(mesh.rotation)
    console.log(mesh.position)
    console.log(mesh.material.opacity)

    console.log(rotation2)
    console.log(position2)
    console.log(material2.opacity)


}