import { createElement, Component } from './framework';

class Carousel extends Component {
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

            /**
                position 最后显示图片的下标

                x%500 小于250 方向需要取反
             */

            const up = e => {
                console.log('up');

                let x = e.clientX - startX;
                position = position - Math.round(x / 500);  

                let index;
                for (let offset of [0,Math.sign(x%500 - Math.sign(x)*250)]) {
                    index = (position + offset + length) % length;
                    children[index].style.transition = '';
                    children[index].style.transform = `translateX(${-index * 500 + offset * 500}px)`;
                    console.log(index,offset,`translateX(${-index * 500 + offset * 500}px)`);
                }

                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);

        })


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

const data = ['https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
    'https://static001.geekbang.org/resource/image/73/2a/737fb9f94c18a26a875c27169222b82a.jpg',
    'https://static001.geekbang.org/resource/image/65/9a/6590fb3f37a385b8d88b8679529e9c9a.jpg',
    'https://static001.geekbang.org/resource/image/71/41/7121e6eea47da51285c9f844fae64f41.jpg',
];

let carousel = <Carousel src={data} />
carousel.mountTo(document.body);