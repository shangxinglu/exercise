import { Component } from './framework';
import {enableGesture} from './gesture';
import {Animation,Timeline} from './animation';

export class Carousel extends Component {
    constructor() {
        super();

        this.attribute = Object.create(null);
    }

    setAttribute(name, value) {
        this.attribute[name] = value;
    }

    render() {
        this.root = document.createElement('div');
        this.root.classList.add('carousel');

        for (let url of this.attribute.src) {
            let img = document.createElement('div');
            img.style.backgroundImage = `url(${url})`;
            img.classList.add('carousel__item');
            this.root.appendChild(img);
        }

        let position = 0;
        let timer;
        const duration = 500;
        let t = 0,ax=0;
        const children = this.root.children,
        { length } = children;
        enableGesture(this.root);
        const timeLine = new Timeline;
        timeLine.start();

        this.root.addEventListener('start',e=>{
            timeLine.pause();
            clearInterval(timer);
            let progress = (Date.now() - t)/duration;
            ax = 500*progress-500;

        })

        this.root.addEventListener('pan',e=>{
            console.log(e.clientX);
            let x = e.clientX - e.startX-ax;
            let current = position - Math.round((x - x % 500) / 500);

            let index;
            const changeArr = [-1, 0, 1];
            for (let offset of changeArr) {
                index = ((current + offset)%length + length) % length;
                children[index].style.transition = 'none';
                children[index].style.transform = `translateX(${-index * 500 + offset * 500 + x % 500}px)`;
            }
        })

        this.root.addEventListener('panend',e=>{
            let x = e.clientX - e.startX-ax;
            position = position - Math.round(x / 500);  

            let index;
            for (let offset of [0,Math.sign(x%500 - Math.sign(x)*250)]) {
                index = (position + offset + length) % length;
                children[index].style.transition = '';
                children[index].style.transform = `translateX(${-index * 500 + offset * 500}px)`;
                // console.log(index,offset,`translateX(${-index * 500 + offset * 500}px)`);
            }
        })
        //  let currentIndex = 0,
        //     nextIndex;
        let nextIndex;

          const nextHandler= e => {

            // currentIndex = currentIndex % length;
            nextIndex = (position + 1) % length;

            const current = children[position],
                next = children[nextIndex];
            next.style.transition = 'none';
            next.style.transform = `translateX(${500-nextIndex * 500}px)`;
            console.log(position,nextIndex);
            t = Date.now();
            timeLine.add(new Animation({
                object:current,
                property:'transform',
                startValue:-position*500,
                endValue:-position*500-500,
                duration,
                template:value=>`translateX(${value}px)`,
            }))

            timeLine.add(new Animation({
                object:next,
                property:'transform',
                startValue:500-nextIndex*500,
                endValue:-nextIndex*500,
                duration,
                template:value=>`translateX(${value}px)`,
            }))
            position = nextIndex;

        }

        timer= setInterval(nextHandler, 3000);
        /*

        this.root.addEventListener('mousedown', e => {
            console.log('mousedown');

            const startX = e.clientX;
            const children = this.root.children,
                { length } = children;
            const changeArr = [-1, 0, 1];

            const move = e => {
                console.log('move');
                let x = e.clientX - startX;
                let current = position - Math.round((x - x % 500) / 500);

                let index;
                for (let offset of changeArr) {
                    index = (current + offset + length) % length;
                    children[index].style.transition = 'none';
                    children[index].style.transform = `translateX(${-index * 500 + offset * 500 + x % 500}px)`;
                }

            }

            */

            /**
                position 最后显示图片的下标

                x%500 小于250 方向需要取反
             */
            
            /*
            const up = e => {
                console.log('up');

                let x = e.clientX - startX;
                position = position - Math.round(x / 500);  

                let index;
                for (let offset of [0,Math.sign(x%500 - Math.sign(x)*250)]) {
                    index = (position + offset + length) % length;
                    children[index].style.transition = '';
                    children[index].style.transform = `translateX(${-index * 500 + offset * 500}px)`;
                    // console.log(index,offset,`translateX(${-index * 500 + offset * 500}px)`);
                }

                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);

        })

        */
        // const children = this.root.children;
        // const { length } = children;

        // let currentIndex = 0,
        //     nextIndex;


        // setInterval(e => {

        //     currentIndex = currentIndex % length;
        //     nextIndex = (currentIndex + 1) % length;

        //     const current = children[currentIndex],
        //         next = children[nextIndex];
        //     next.style.transition = 'none';
        //     next.style.transform = `translateX(${100-nextIndex * 100}%)`;

        //     setTimeout(() => {
        //         next.style.transition = '';
        //         current.style.transform = `translateX(${-100-currentIndex * 100}%)`;
        //         next.style.transform = `translateX(${-nextIndex * 100}%)`;
        //         currentIndex = nextIndex;
        //     }, 16);
        // }, 2000)


        return this.root;
    }

    mountTo(parent) {
        parent.appendChild(this.render());
    }

}