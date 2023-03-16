export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = '画线'

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(15, width / height, 1, 500);
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    const material1 = new THREE.LineBasicMaterial();

    // 通过颜色对象设置材质颜色
    const color = new THREE.Color();
    // color.setRGB(1,0,0);//RGB方式设置颜色
    // color.setHex(0x00ff00);//十六进制方式设置颜色
    // color.setStyle('red');//前端CSS颜色值设置颜色
    color.set('red');//前端CSS颜色值设置颜色
    material1.color = color

    let points1 = [];
    points1.push(new THREE.Vector3(-10, -10, 0)); // 三维向量 Vector3
    points1.push(new THREE.Vector3(0, 10, 0));

    // 用 setFromPoints() 给geometry.attributes.position属性赋值
    const geometry1 = new THREE.BufferGeometry().setFromPoints(points1);
    const line1 = new THREE.Line(geometry1, material1);
    scene.add(line1);

    let points2 = [];
    points2.push(new THREE.Vector3(0, 10, 0));
    let point = new THREE.Vector3(20, 10, 0);
    // point.set(10, -10, 0);//set方法设置向量的值
    points2.push(point);
    // console.log('point', point.x); //访问x、y或z属性改变某个分量的值
    // console.log(point.normalize()) //向量归一化
    const material2 = new THREE.LineDashedMaterial({
        color: 'blue',
        scale: 0.5, // 线条中虚线部分的占比。默认值为 1。
        dashSize: 0.5, // 虚线的大小，是指破折号和间隙之和。默认值为 3。
        gapSize: 0.5, // 间隙的大小，默认值为 1。比例越大，虚线越密；反之，虚线越疏
    });
    const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
    const line2 = new THREE.Line(geometry2, material2);
    scene.add(line2);


    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setClearColor('gray', 0.1)
    canvas.appendChild(renderer.domElement);
    renderer.render(scene, camera);

}