
import mp3 from '../../../assets/music/ping_pong.mp3';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function (wap, THREE, title) {
    title.innerHTML = '位置相关的音频对象2';
    let width = wap.offsetWidth,
        height = wap.offsetHeight;

    let scene, camera, renderer, clock;
    function makePage() {

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

function resetColor(target) {
    Array.from(target.parentElement.children).forEach(li => {
        li.style.color = ''
    });
    target.style.color = 'red';
}