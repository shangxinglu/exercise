import { Carousel } from './carousel.js';
import { createElement } from './framework.js';

import { Timeline, Animation } from './animation.js';

const data = ['https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
    'https://static001.geekbang.org/resource/image/73/2a/737fb9f94c18a26a875c27169222b82a.jpg',
    'https://static001.geekbang.org/resource/image/65/9a/6590fb3f37a385b8d88b8679529e9c9a.jpg',
    'https://static001.geekbang.org/resource/image/71/41/7121e6eea47da51285c9f844fae64f41.jpg',
];

let carousel = <Carousel src={data} />

const timeline = new Timeline;
const animation = new Animation({}, 'width', 0, 0,  200,1000, 500);
timeline.add(animation);
timeline.start();

carousel.mountTo(document.body);