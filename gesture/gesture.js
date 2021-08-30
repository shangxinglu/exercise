

export class Listener {
    constructor(el, recognizer) {
        const contextMap = new Map;
        let isListenerMouse = false;


        el.addEventListener('mousedown', e => {

            const ctx = Object.create(null);

            contextMap.set(`mouse${1 << e.button}`, ctx);
            console.log(e.button, e.buttons);
            recognizer.start(e, ctx);

            const moveHandler = e => {
                let button = 1;
                while (e.buttons >= button) {

                    if (e.buttons & button) {
                        let key;
                        switch (button) {
                            case 2:
                                key = 4;
                                break;

                            case 4:
                                key = 2;
                                break;

                            default:
                                key = button;
                        }

                        console.log(e.buttons);

                        const ctx = contextMap.get(`mouse${key}`);
                        recognizer.move(e, ctx);
                    }

                    button = button << 1;
                }
            }

            const upHandler = e => {
                const ctx = contextMap.get(`mouse${1 << e.button}`);
                recognizer.end(e, ctx);
                contextMap.delete(`mouse${1 << e.button}`);
                if (e.buttons === 0) {
                    document.removeEventListener('mousemove', moveHandler);
                    document.removeEventListener('mouseup', upHandler);
                    isListenerMouse = false;
                }


            }


            if (!isListenerMouse) {
                document.addEventListener('mousemove', moveHandler);
                document.addEventListener('mouseup', upHandler);
                isListenerMouse = true;
            }

        });


        el.addEventListener('touchstart', e => {
            const { changedTouches } = e;
            for (let touch of changedTouches) {
                const obj = Object.create(null);
                contextMap.set(touch.identifier, obj);
                recognizer.start(touch, obj);
            }


        });

        el.addEventListener('touchmove', e => {
            const { changedTouches } = e;

            for (let touch of changedTouches) {
                const ctx = contextMap.get(touch.identifier);
                recognizer.move(touch, ctx);
            }
        });

        el.addEventListener('touchend', e => {
            const { changedTouches } = e;

            for (let touch of changedTouches) {
                const ctx = contextMap.get(touch.identifier);
                recognizer.end(touch, ctx);
                contextMap.delete(touch.identifier);
            }
        });

        el.addEventListener('touchcancel', e => {
            const { changedTouches } = e;

            for (let touch of changedTouches) {
                const ctx = contextMap.get(touch.identifier);
                recognizer.cancel(touch, ctx);
            }
        });

    }
}


export class Recognizer {
    constructor(dispatcher) {
        this.dispatch = dispatcher.dispatch.bind(dispatcher);
    }


    start(point, ctx) {
        // console.log('start');
        ctx.point = [{
            t: Date.now(),
            x: point.clientX,
            y: point.clientY,
        }];


        ctx.isPan = false,
            ctx.isPress = false,
            ctx.isTap = true;

        ctx.startX = point.clientX, ctx.startY = point.clientY;
        ctx.pressTimer = setTimeout(e => {
            ctx.isPan = false,
                ctx.isPress = true,
                ctx.isTap = false,
                ctx.pressTimer = null;
            console.log('press');
        }, 500);
        // console.log(point.clientX,point.clientY);
    }

    move(point, ctx) {
        // console.log('move');

        const dx = point.clientX - ctx.startX,
            dy = point.clientY - ctx.startY;

        if (!ctx.isPan && dx ** 2 + dy ** 2 > 100) {
            ctx.isPan = true,
                ctx.isPress = false,
                ctx.isTap = false;
            ctx.isVertical = Math.abs(dx) < Math.abs(dy);

            this.dispatch('panstart', {
                startX: ctx.startX,
                startY: ctx.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: ctx.isVertical,

            });

            if (ctx.pressTimer) {
                clearTimeout(ctx.pressTimer);
                ctx.pressTimer = null;
            }


        }

        if (ctx.isPan) {
            this.dispatch('pan', {
                startX: ctx.startX,
                startY: ctx.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: ctx.isVertical,

            });
        }

        ctx.point.push({
            t: Date.now(),
            x: point.clientX,
            y: point.clientY,
        })

        // console.log(point.clientX,point.clientY);

    }

    end(point, ctx) {
        // console.log('end');
        if (ctx.isTap) {
            this.dispatch('tap');
            if (ctx.pressTimer) {
                clearTimeout(ctx.pressTimer);
                ctx.pressTimer = null;
            }
        }

        if (ctx.isPress) {
            this.dispatch('pressend');
        }


        ctx.point = ctx.point.filter(point => Date.now() - point.t < 500);

        let first = ctx.point[0];
        let d = 0, v = 0;
        if (first) {
            d = Math.sqrt((point.clientX - first.x) ** 2 + (point.clientY - first.y) ** 2);
            v = d / (Date.now() - first.t);
        }
        console.log('speed', v);
        if (v > 1.5) {
            ctx.isFlick = true;
            this.dispatch('flick', {
                startX: ctx.startX,
                startY: ctx.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: ctx.isVertical,
                velocity: v,
            });
        } else {
            ctx.isFlick = false;
        }

        if (ctx.isPan) {
            this.dispatch('pan', {
                startX: ctx.startX,
                startY: ctx.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: ctx.isVertical,
                isFilck: ctx.isFilck,

            });
        }

    }

    cancel(point, ctx) {
        if (ctx.pressTimer) {
            clearTimeout(ctx.pressTimer);
            ctx.pressTimer = null;
        }
        this.dispatch('cancel');

    }
}

export class Dispatcher {
    constructor(el) {
        this.el = el;
    }

    // 事件派发
    dispatch(type, properties = {}) {
        const event = new Event(type);
        console.log(`dispatch ${type}`);
        for (let key of Object.keys(properties)) {
            event[key] = properties[key];
        }

        this.el.dispatchEvent(event);


    }
}

export function enableGesture(el) {
    new Listener(el,new Recognizer(new Dispatcher(el)));
}







