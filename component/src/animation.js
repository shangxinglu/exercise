const TICK = Symbol('tick');
const ANIMATION = Symbol('animation');
const START_TIME = Symbol('start_time');
const TICK_HANDLER = Symbol('tick_handler');
const PAUSE_START = Symbol('pause_start');
const PAUSE_TIME = Symbol('pause_time');

export class Timeline {
    constructor() {
        this.state = 'init';
        this[ANIMATION] = new Set;
        this[START_TIME] = new Map;
    }

    // 队列中添加动画
    add(animation, startTime = Date.now()) {
        this[ANIMATION].add(animation);
        this[START_TIME].set(animation, startTime);
    }

    // 开始
    start() {
        if(this.state !=='init') return;
        this.state = 'start';
        const queue = this[ANIMATION];
        const startTime = Date.now();
        this[PAUSE_TIME] = 0;
        this[TICK] = () => {
            const now = Date.now();
            let t;
            for (let animation of queue) {
                const start = this[START_TIME].get(animation);
                if (start > startTime) {
                    t = now - start - this[PAUSE_TIME] - animation.delay;
                } else {
                    t = now - startTime-this[PAUSE_TIME]- animation.delay;
                }
                if (t > animation.duration) {
                    queue.delete(animation);
                    t = animation.duration;
                }

                if(t>0) {
                    animation.receive(t);
                }


            }
            this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
        }
        this[TICK]();
    }

    // 暂停
    pause() {
        if(this.state !=='start') return;
        
        this.state = 'pause';
         this[PAUSE_START] = Date.now();
        cancelAnimationFrame(this[TICK_HANDLER]);
    }

    // 恢复
    resume() {
        if(this.state !=='pause') return;
        
        this.state = 'start';
       this[PAUSE_TIME] = Date.now() - this[PAUSE_START];
       this[TICK]();
    }

    // 重置
    reset() {
        this.state = 'init';
        this.pause();
        this[ANIMATION] = new Set;
        this[START_TIME] = new Map;
        this[PAUSE_START] = 0;
        this[PAUSE_TIME]  = 0;
        this[TICK_HANDLER] = null;
    }
}


/**
 * @desc 动画
 * 
 * @param {Object} options
 * @param {Object} options.object 操作对象
 * @param {String} options.property 属性
 * @param {String|Number} options.startValue 初始值
 * @param {String|Number} options.endValue 结束值
 * @param {Number} options.duration 持续时间
 * @param {Number} options.delay 延迟时间
 * @param {Function} options.timingFunction 时间函数
 * @param {Function} options.template
 */
export class Animation {
    constructor(options) {
        ({
            object: this.object,
            property: this.property,
            startValue: this.startValue,
            endValue: this.endValue,
            duration: this.duration,
            delay: this.delay= 0,
            timingFunction: this.timingFunction = null,
            template: this.template,
        } = options);
    }

    receive(time) {
        const { object, property, startValue, endValue, duration,template } = this;
        const range = endValue - startValue;
        object.style[property] = template(startValue + range * time / duration);
    }
}