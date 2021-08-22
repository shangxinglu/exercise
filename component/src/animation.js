const TICK = Symbol('tick');
const ANIMATION = Symbol('animation');

export class Timeline{
    constructor(){
        const queue = new Set;
        this[ANIMATION] = queue;
        const startTime = Date.now();
        this[TICK] = ()=>{
            const t = Date.now() - startTime;
            for(let animation of queue){
                if(t>animation.duration){
                    queue.delete(animation);
                }

                animation.receive(t);

            }
            requestAnimationFrame(this[TICK]);
        }
    }

    // 队列中添加动画
    add(animation){
        this[ANIMATION].add(animation);
    }

    // 开始
    start(){
        this[TICK]();
    }

    // 暂停
    pause(){

    }

    // 恢复
    resume(){

    }

    // 重置
    reset(){

    }
}


export class Animation{
    constructor(object,property,startValue,endValue,duration,timingFunction){
        this.object = object,
        this.property = property,
        this.startValue = startValue,
        this.endValue = endValue,
        this.duration = duration,
        this.timingFunction = timingFunction;
    }

    receive(time){
        const {object,property,startValue,endValue,duration} = this;
        if(time>duration){
            time = duration;
        }
        console.log(time);
        const range = endValue-startValue;
        object[property] = startValue + range * time/duration;
    }
}