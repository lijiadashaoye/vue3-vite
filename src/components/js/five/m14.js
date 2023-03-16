
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function (canvas, THREE, title) {
    let width = canvas.offsetWidth,
        height = canvas.offsetHeight;
    title.innerHTML = '曲线Curve'

    // 透视摄像机:PerspectiveCamera(视野角度,近截面/远截面)
    let camera = new THREE.PerspectiveCamera(15, width / height, 0.1, 100); // 投影视图
    camera.position.set(0, 10, 30);

    // 椭圆弧线，EllipseCurve( aX, aY, xRadius,yRadius, aStartAngle, aEndAngle, aClockwise )
    // aX, aY	椭圆中心坐标
    // xRadius	椭圆x轴半径
    // yRadius	椭圆y轴半径
    // aStartAngle	弧线开始角度，从x轴正半轴开始，默认0，弧度单位
    // aEndAngle	弧线结束角度，从x轴正半轴算起，默认2 x Math.PI，弧度单位
    // aClockwise	是否顺时针绘制，默认值为false
    const ellipse = new THREE.EllipseCurve(0, 0, 2, 1);
    // .getPoints()可以从曲线上获取顶点数据，取的越多，精度越大
    const pointsArr1 = ellipse.getPoints(30); //分段数50，返回51个顶点
    const geometry1 = new THREE.BufferGeometry();
    geometry1.setFromPoints(pointsArr1);
    // 材质
    const material1 = new THREE.PointsMaterial({
        color: 'blue',
        size: 1.2 //点对象像素尺寸
    });
    const points1 = new THREE.Points(geometry1, material1);// 点模型
    const line1 = new THREE.Line(geometry1, material1); // 线条模型对象

    // 圆弧线，ArcCurve( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise )
    // aX, aY	圆心坐标
    // aRadius	圆弧半径
    // aStartAngle	弧线开始角度，从x轴正半轴开始，默认0，弧度单位
    // aEndAngle	弧线结束角度，从x轴正半轴算起，默认2 x Math.PI，弧度单位
    // aClockwise	是否顺时针绘制，默认值为false
    const arc = new THREE.ArcCurve(0, 0, 1.2, 0, 1 * Math.PI);
    const pointsArr2 = arc.getPoints(10); //分段数50，返回51个顶点
    const geometry2 = new THREE.BufferGeometry();
    geometry2.setFromPoints(pointsArr2);
    // 材质
    const material2 = new THREE.PointsMaterial({
        color: '#919102',
        size: 1.2 //点对象像素尺寸
    });
    const points2 = new THREE.Points(geometry2, material2);// 点模型
    const line2 = new THREE.Line(geometry2, material2); // 线条模型对象

    // 二维向量Vector3创建一组顶点坐标，作为曲线的端点和控制点
    const arr2D = [
        new THREE.Vector3(-3, -2),
        new THREE.Vector3(-1, -4),
        new THREE.Vector3(2, 2),
    ]
    // 2D曲线,SplineCurve 默认情况下就是在XOY平面生成一个平面的样条2D曲线
    const curve2D = new THREE.SplineCurve(arr2D);
    const pointsArr2D = curve2D.getPoints(30);
    const geometry2D = new THREE.BufferGeometry();
    //读取坐标数据赋值给几何体顶点，其实用arr2D三个点也行，但就不会那么平滑
    geometry2D.setFromPoints(pointsArr2D);
    // 材质
    const material2D = new THREE.PointsMaterial({
        color: 'red',
        size: 1.2 //点对象像素尺寸
    });
    const points2D = new THREE.Points(geometry2D, material2D);// 点模型
    const line2D = new THREE.Line(geometry2D, material2D); // 线条模型对象

    // 三维向量Vector3创建一组顶点坐标
    const arr3D = [
        new THREE.Vector3(-3, 2, 4),
        new THREE.Vector3(-1, 4, 4),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(3, -3, 0),
        new THREE.Vector3(4, 0, 8)
    ]
    // 三D曲线，CatmullRomCurve3是3D样条曲线API
    const curve3D = new THREE.CatmullRomCurve3(arr3D);
    const pointsArr3D = curve3D.getPoints(30);
    const geometry3D = new THREE.BufferGeometry();
    //读取坐标数据赋值给几何体顶点
    geometry3D.setFromPoints(pointsArr3D);
    // 材质
    const material3D = new THREE.PointsMaterial({
        color: 'green',
        size: 1.2 //点对象像素尺寸
    });
    const points3D = new THREE.Points(geometry3D, material3D);// 点模型
    const line3D = new THREE.Line(geometry3D, material3D); // 线条模型对象

    // p1、p2、p3表示三个点坐标
    // p1、p3是曲线起始点，p2是曲线的控制点
    const p1 = new THREE.Vector2(-3, -4);
    const p2 = new THREE.Vector2(4, 6);
    const p3 = new THREE.Vector2(5, -4);
    // 二维二次贝赛尔曲线
    const bezier2 = new THREE.QuadraticBezierCurve(p1, p2, p3);
    const bezier2Arr = bezier2.getPoints(10); //曲线上获取点
    const bezier2geometry = new THREE.BufferGeometry();
    bezier2geometry.setFromPoints(bezier2Arr); //读取坐标数据赋值给几何体顶点
    // 材质
    const materialbezier2 = new THREE.PointsMaterial({
        color: '#00ff27', size: 1.2 //点对象像素尺寸
    });
    const bezier2points = new THREE.Points(bezier2geometry, materialbezier2);// 点模型
    const bezier2line = new THREE.Line(bezier2geometry, materialbezier2);

    // p1、p2、p3表示三个点坐标
    // p1、p3是曲线起始点，p2是曲线的控制点
    const p11 = new THREE.Vector2(-4, -2, 3);
    const p22 = new THREE.Vector2(2, 7, 2);
    const p33 = new THREE.Vector2(4, -2, -4);
    // 三维二次贝赛尔曲线
    const bezier3 = new THREE.QuadraticBezierCurve3(p11, p22, p33);
    const bezier3Arr = bezier3.getPoints(10); //曲线上获取点
    const bezier3geometry = new THREE.BufferGeometry();
    bezier3geometry.setFromPoints(bezier3Arr); //读取坐标数据赋值给几何体顶点
    // 材质
    const materialbezier3 = new THREE.PointsMaterial({
        color: 'black', size: 1.2 //点对象像素尺寸
    });
    const bezier3points = new THREE.Points(bezier3geometry, materialbezier3);// 点模型
    const bezier3line = new THREE.Line(bezier3geometry, materialbezier3);

    // p1、p2、p3表示三个点坐标
    const p1111 = new THREE.Vector3(-6, -4, 0);
    const p2222 = new THREE.Vector3(-2, -1, 0);
    const p3333 = new THREE.Vector3(4, 2, 9);
    const p4444 = new THREE.Vector2(6, 4, 0);
    // 二维三次贝赛尔曲线
    const bezier33 = new THREE.CubicBezierCurve(p1111, p2222, p3333, p4444);
    const bezier33Arr = bezier33.getPoints(10); //曲线上获取点
    const bezier33geometry = new THREE.BufferGeometry();
    bezier33geometry.setFromPoints(bezier33Arr); //读取坐标数据赋值给几何体顶点
    // 材质
    const materialbezier33 = new THREE.PointsMaterial({
        color: '#ff6400', size: 1.2 //点对象像素尺寸
    });
    const bezier33points = new THREE.Points(bezier33geometry, materialbezier33);// 点模型
    const bezier33line = new THREE.Line(bezier33geometry, materialbezier33);

    // p1、p2、p3表示三个点坐标
    const p111 = new THREE.Vector3(-6, 0, 0);
    const p222 = new THREE.Vector3(2, 9, 0);
    const p333 = new THREE.Vector3(4, 0, 9);
    // 三维三次贝赛尔曲线
    const bezier32 = new THREE.CubicBezierCurve3(p111, p222, p333);
    const bezier32Arr = bezier32.getPoints(10); //曲线上获取点
    const bezier32geometry = new THREE.BufferGeometry();
    bezier32geometry.setFromPoints(bezier32Arr); //读取坐标数据赋值给几何体顶点
    // 材质
    const materialbezier32 = new THREE.PointsMaterial({
        color: '#7629fc', size: 1.2 //点对象像素尺寸
    });
    const bezier32points = new THREE.Points(bezier32geometry, materialbezier32);// 点模型
    const bezier32line = new THREE.Line(bezier32geometry, materialbezier32);

    let scene = new THREE.Scene(); // 场景
    scene.add(points1);
    scene.add(line1);
    scene.add(points2);
    scene.add(line2);
    scene.add(points2D);
    scene.add(line2D);
    scene.add(points3D);
    scene.add(line3D);
    scene.add(bezier2points);
    scene.add(bezier2line);
    scene.add(bezier3points);
    scene.add(bezier3line);
    scene.add(bezier32points);
    scene.add(bezier32line);
    scene.add(bezier33points);
    scene.add(bezier33line);

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
