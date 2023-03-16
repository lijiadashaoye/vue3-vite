
export default function (can) {
    let gl = can.getContext('webgl'),
        cwidth = can.offsetWidth,
        cheight = can.offsetHeight;
    gl.viewport(0, 0, cwidth, cheight); // 设置视图端口
    // 将绘制和清除区域剪裁到一些小的方形画布中，局部清除
    gl.enable(gl.SCISSOR_TEST);

    for (let i = 0; i < 100; ++i) {
        const x = rand(0, cwidth);
        const y = rand(0, cheight);
        const width = rand(0, cwidth - x);
        const height = rand(0, cheight - y);
        drawRect(x, y, width, height, [rand(1), rand(1), rand(1), 1]);
    }

    function rand(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    }
    function drawRect(x, y, width, height, color) {
        // 将剪裁矩形设置到相对于左下角的相对位置，以像素计
        gl.scissor(x, y, width, height);
        gl.clearColor(...color);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }


}