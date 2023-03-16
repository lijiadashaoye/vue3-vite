
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = 'CurvePath拼接曲线+管道TubeGeometry+旋转成型LatheGeometry+拉伸ExtrudeGeometry+扫描造型'

    // 透视摄像机:PerspectiveCamera(视野角度,近截面/远截面)
    let camera = new THREE.PerspectiveCamera(15, width / height, 0.1, 100); // 投影视图
    camera.position.set(0, 10, 30);

    // CurvePath拼接曲线
    const R = 1.5;//圆弧半径
    const H = 2;//直线部分高度
    // 直线1
    const line1 = new THREE.LineCurve(new THREE.Vector2(-2, H), new THREE.Vector2(-2, 0));
    // 圆弧
    const arc = new THREE.ArcCurve(-2 - R, 0, R, 0, Math.PI, true);
    // 直线2
    const line2 = new THREE.LineCurve(new THREE.Vector2(-2 * R - 2, 0), new THREE.Vector2(-2 * R - 2, H));

    // CurvePath创建一个组合曲线对象
    const CurvePath = new THREE.CurvePath();
    // line1, arc, line2拼接出来一个U型轮廓曲线，组合曲线的坐标顺序和线条组合顺序不能随意写，
    // 总的方向，就是先确定整个曲线的起点，然后沿着一个方向依次绘制不同曲线，确保不同曲线首尾相接
    CurvePath.curves.push(line1, arc, line2);
    const point = CurvePath.getPoints(10); //曲线上获取点
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(point); //读取坐标数据赋值给几何体顶点
    // 材质
    const material = new THREE.PointsMaterial({
        color: '#ff6400', size: 1.2,
    });
    const line = new THREE.Line(geometry, material);
    const points = new THREE.Points(geometry, material);

    // 管道TubeGeometry
    // 三维样条曲线
    // const path = new THREE.CatmullRomCurve3([
    //     new THREE.Vector3(-5, 2, 9),
    //     new THREE.Vector3(-1, 4, 4),
    //     new THREE.Vector3(0, 0, 0),
    //     new THREE.Vector3(6, -6, 0),
    //     new THREE.Vector3(7, 0, 8)
    // ]);
    // LineCurve3创建直线段路径
    // const path = new THREE.LineCurve3(new THREE.Vector3(0, 100, 0), new THREE.Vector3(0, 0, 0));

    // 三维二次贝赛尔曲线
    const path = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-5, 0, 0),
        new THREE.Vector3(-2, 7, 0),
        new THREE.Vector3(1, 0, 2)
    );

    // TubeGeometry(path, tubularSegments, radius, radiusSegments, closed)
    // path	扫描路径，路径要用三维曲线
    // tubularSegments	路径方向细分数，默认64
    // radius	管道半径，默认1
    // radiusSegments	管道圆弧细分数，默认8
    // closed	Boolean值，管道是否闭合,默认false
    const tubege = new THREE.TubeGeometry(path, 40, 0.6, 25);
    const material1 = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,//双面显示看到管道内壁
    });
    const linetubege = new THREE.Line(tubege, material1); // 线条模型对象

    // 旋转成型LatheGeometry
    // LatheGeometry(points, segments, phiStart, phiLength)
    // points	Vector2表示的坐标数据组成的数组作为旋转轮廓
    // segments	圆周方向细分数，默认12
    // phiStart	开始角度,默认0
    // phiLength	旋转角度，默认2π
    const pointsArr = [
        new THREE.Vector2(1.3, -1.8),
        new THREE.Vector2(1, -3),
        new THREE.Vector2(1.2, -3.5)
    ];
    // LatheGeometry的旋转轮廓默认绕y轴旋转生成曲面几何体
    const geometryLathe = new THREE.LatheGeometry(pointsArr, 30, 0, 2 * Math.PI);
    const materialLathe = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,//双面显示看到管道内壁
    });
    const Lathe = new THREE.Line(geometryLathe, materialLathe); // 线条模型对象

    const pointsArr2 = [
        new THREE.Vector2(3, -4),
        new THREE.Vector2(2.1, -2),
        new THREE.Vector2(3.1, -1),
        new THREE.Vector2(5, 0),
        new THREE.Vector2(6, -4),
    ]
    const shape = new THREE.Shape(pointsArr2);
    const geometry2 = new THREE.ShapeGeometry(shape);
    const materialLathe2 = new THREE.MeshLambertMaterial({
        wireframe: true,
    });
    const shapeLine = new THREE.Line(geometry2, materialLathe2); // 线条模型对象


    const ls = new THREE.Shape([
        // 按照特定顺序，依次书写多边形顶点坐标
        new THREE.Vector2(3.4, 2), //多边形起点
        new THREE.Vector2(3.4, 2.5),
        new THREE.Vector2(4, 2.5),
        new THREE.Vector2(4, 2),
    ]);
    //拉伸造型
    const geometryls = new THREE.ExtrudeGeometry(
        ls, //二维轮廓
        {
            depth: 2, //拉伸长度
            // 倒圆角
            bevelThickness: 1, //倒角尺寸:拉伸方向
            bevelSize: 1, //倒角尺寸:垂直拉伸方向
            bevelSegments: 20, //倒圆角：倒角细分精度，默认3
            //倒直角
            // bevelSegments: 1,
            // bevelEnabled: false, //禁止倒角,默认true
        }
    );
    const materialls = new THREE.MeshLambertMaterial({
        wireframe: true,
    });
    const shapels = new THREE.Line(geometryls, materialls); // 线条模型对象


    // 扫描轮廓：Shape表示一个平面多边形轮廓
    const shapesm = new THREE.Shape([
        // 按照特定顺序，依次书写多边形顶点坐标
        new THREE.Vector2(-4, -2), //多边形起点
        new THREE.Vector2(-4, -1),
        new THREE.Vector2(-3, -1),
        new THREE.Vector2(-3, -2),
    ]);
    // 扫描轨迹
    const curvesm = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6, -1, -1),
        new THREE.Vector3(-4, 1, -1),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 1)
    ]);
    const geometrysm = new THREE.ExtrudeGeometry(
        shapesm, //扫描轮廓
        {
            extrudePath: curvesm,//扫描轨迹
            steps: 100//沿着路径细分精度，越大越光滑
        }
    );
    const materialsm = new THREE.MeshLambertMaterial({
        wireframe: true,
    });
    const end = new THREE.Line(geometrysm, materialsm); // 线条模型对象


    // 管道
    const curve = new THREE.SplineCurve([
        new THREE.Vector2(2, 4),
        new THREE.Vector2(0.5, 0),
        new THREE.Vector2(2, -1)
    ]);
    //曲线上获取点,作为旋转几何体的旋转轮廓
    const pointsArr1 = curve.getPoints(50);
    // LatheGeometry：pointsArr轮廓绕y轴旋转生成几何体曲面
    const geometry1 = new THREE.LatheGeometry(pointsArr1, 30);

    const materialcurve = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,//双面显示看到管道内壁
    });
    const Lathecurve = new THREE.Line(geometry1, materialcurve); // 线条模型对象

    let scene = new THREE.Scene(); // 场景
    scene.add(line)
    scene.add(points)
    scene.add(linetubege)
    scene.add(Lathe)
    scene.add(Lathecurve)
    scene.add(shapeLine)
    scene.add(shapels)
    scene.add(end)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 环境光
    const pointLight = new THREE.PointLight(0xffffff, 1); // 点光源
    pointLight.position.set(50, 50, 30);//点光源位置
    scene.add(pointLight); //点光源添加到场景中
    scene.add(ambientLight); //环境光:没有特定方向，整体改变场景的光照明暗

    // 渲染器
    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setClearColor('blue', 0.1); //设置背景颜色

    //解决加载gltf格式模型纹理贴图渲染结果颜色偏差不一样问题
    renderer.outputEncoding = THREE.sRGBEncoding;
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
