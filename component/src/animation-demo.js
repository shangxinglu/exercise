
import { Timeline, Animation } from './animation.js';

const pauseBtn = document.querySelector('.pause');
const resumeBtn = document.querySelector('.resume');

pauseBtn.addEventListener('click',e=>{
    timeline.pause();
});

resumeBtn.addEventListener('click',e=>{
    timeline.resume();
})

const timeline = new Timeline;
const animation = new Animation({
    object:document.querySelector('#div'),
    property:'transform',
    startValue: 0,
    endValue: 400,
    duration: 2000,
    delay:0,
    template:val=>`translateX(${val}px)`,
});
timeline.add(animation);
timeline.start();