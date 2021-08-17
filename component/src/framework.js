export function createElement(type,attrs,...children){
    let el;
    if(typeof type === 'string'){
        el = new ElementWrapper(type);
    } else {
        el = new type;
    }

    for(let attrName of Reflect.ownKeys(attrs||{})){
        el.setAttribute(attrName,attrs[attrName]);
    }

    for(let child of children){
       if(typeof child === 'string'){
           child = new TextNodeWrapper(child);
       }

       el.appendChild(child);
    }
    
    return el;
}

export class Component{
    constructor(type){
        this.type = type;
    }
    setAttribute(name,value){
        this.root.setAttribute(name,value);
    }

    appendChild(child){
        child.mountTo(this.root);
    }

    mountTo(parent){
        parent.appendChild(this.root);
    }
}

export class ElementWrapper extends Component{
    render(){
        const el = document.createElement(this.type);
        return el;
    }
}

export class TextNodeWrapper  extends Component{
    render(){
        const el = document.createTextNode(this.type);
        return el;
    
    }
}