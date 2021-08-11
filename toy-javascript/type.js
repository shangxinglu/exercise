


export class JSValue {
    get type() {
        const typeClass = this.constructor;
        switch (typeClass) {
            case JSUndefined:
                return 'undefined';
                break;

            case JSNull:
                return 'null';
                break;

            case JSBoolean:
                return 'boolean';
                break;

            case JSNumber:
                return 'number';
                break;

            case JSString:
                return 'string';
                break;

            case JSObject:
                return 'object';
                break;

            case JSSymbol:
                return 'symbol';
                break;
        }
      
    }
}

export class JSUndefined extends JSValue {
    get value() {
        return void 0;
    }

    toNumber(){
        return new JSNumber(NaN);
    }

    toBoolean(){
        return new JSBoolean(false);
    }

    toString(){
        return new JSString(['u','n','d','e','f','i','n','e','d']);
    }
}

export class JSNull extends JSValue {
    get value(){
        return null;
    }

    toNumber(){
        return new JSNumber(0);
    }

    toBoolean(){
        return new JSBoolean(false);
    }

    toString(){
        return new JSString(['n','u','l','l']);
    }
}

export class JSNumber extends JSValue {
    constructor(value) {
        super();
        this.memory = new ArrayBuffer(8);
        new Float64Array(this.memory)[0] = value; 
    }

    get value(){
        return new Float64Array(this.memory)[0];
    }

    toBoolean(){
        if(new Float64Array(this.memory)[0]===0) return new JSBoolean(false);

        return new JSBoolean(true);
    }
}

export class JSBoolean extends JSValue {
    constructor(value) {
        super();
        this.value = !!value || false;
    }

    toBoolean(){
        return this;
    }

    toNumber(){
        if(this.value) return new JSNumber(1);

        return new JSNumber(0);
    }

    toString(){
        if(this.value) return new JSString(['t','r','u','e']);

        return new JSString(['f','a','l','s','e']);
    }
}


export class JSString extends JSValue {
    constructor(chars) {
        super();
        this.chars = chars;
    }
}

export class JSObject extends JSValue {
    constructor(proto) {
        super();
        this.properties = new Map;
        this.prototype = proto|| null;
    }

    setPrototype(proto){
        this.prototype = proto;
    }

    getPrototype(){
        return this.prototype;
    }

    setProperty(name,value){
        this.properties.set(name,value);
    }
}

export class JSSymbol extends JSValue {
    constructor(name) {
        super();
        this.name = name||'';
    }
}