
// 与window绑定的领域
export class Realm {
    constructor() {
        this.Global = new Map;
        this.Object = new Map;
        this.ObjectPrototype = new Map;
    }
}

// 词法环境
export class EnvironmentRecord {
    constructor() {
        this.thisValue = null;
        this.variable = new Map;
        this.outer = null;

    }
}

// 执行上下文
export class ExecutionContext {
    constructor(realm, lexicalEnvironment, variableEnvironment) {
        variableEnvironment = variableEnvironment || lexicalEnvironment;
        this.realm = realm;
        this.lexicalEnvironment = lexicalEnvironment;
        this.variableEnvironment = variableEnvironment;
    }
}

// 引用类型
export class Reference {
    constructor(obj, property) {
        this.object = obj;
        this.property = property;
    }

    set(value) {
        const { object, property } = this;
        object[property] = value;
    }

    get() {
        const { object, property } = this;

        return object[property];
    }
}

const execStack = []; // 执行栈

// 推入执行栈
export function pushExecStack(ctx) {
    execStack.push(ctx)
}

// 移除执行栈
export function popExecStack() {
    return execStack.pop();
}

// 获取当前执行栈
export function getCurrentExecStack() {
    return execStack[execStack.length - 1];
}


export class Execution {

    constructor(realm) {
        this.realm = realm;
    }

    exec(node) {
        return this[node.type]?.(node);
    }

    Program(node) {
        const [child] = node.children;
        return this.exec(child);
    }

    StatementList(node) {
        const { children } = node,
            { length } = children;

        switch (length) {
            case 1:
                return this.exec(children[0]);
                break;

            case 2:
                this.exec(children[0]);
                return this.exec(children[1]);
                break;
        }
    }

    Statement(node) {
        const { children } = node;
        return this.exec(children[0]);

    }
    ExpressionStatement(node) {
        const { children } = node;
        return this.exec(children[0]);

    }
    Expression(node) {
        const { children } = node;
        return this.exec(children[0]);

    }

    LogicalORExpression(node) {
        const { children } = node,
            { length } = children;

        switch (length) {
            case 1:
                return this.exec(children[0]);
                break;

            case 3:
                const result = this.exec(children[0]);
                if (result) return result;

                return this.exec(children[2]);

                break;
        }
    }

    LogicalANDExpression(node) {
        const { children } = node,
            { length } = children;

        switch (length) {
            case 1:
                return this.exec(children[0]);
                break;

            case 3:
                const result = this.exec(children[0]);
                if (!result) return result;

                return this.exec(children[2]);
                break;
        }
    }

    AdditionExpression(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 1:
                return this.exec(children[0]);
                break;

            case 3:
                let left = this.exec(children[0]),
                right = this.exec(children[2]),
                operator = children[1].type;

                if(left instanceof Reference){
                    left = left.get();
                }

                if(right instanceof Reference){
                    right = right.get();
                }

                if(operator === '+'){
                    return left+right;
                } else if (operator === '-'){
                    return left-right;
                }
               
                break;
        }
    }

    MultiplicationExpression(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 1:
                return this.exec(children[0]);
                break;

            case 3:
                return this.exec(children[2]);
                break;
        }
    }

    LeftHandSideExpression(node) {
        const { children } = node;

        return this.exec(children[0]);

    }

    // CallExpression(node){
    //     const { children } = node;

    //     return this.exec(children[0]);
    // }

    NewExpression(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 1:
                return this.exec(children[0]);
                break;

            case 2:
                const cls = this.exec(children[1]);
                return cls.construct();

                // const obj = this.realm.Object.construct();
                // const cls = this.exec(children[1]);
                // const instace = cls.call(obj);

                // if(typeof instace ==='object'){
                //     return instace;
                // } else {
                //     return obj;
                // }
                break;
        }
    }

    MemberExpression(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 1:
                return this.exec(children[0]);
                break;

            case 3:
                const identifier = children[2].value;
                const objRefer = this.exec(children[0]);
                const obj = objRefer.get();
                const desc = obj.get(identifier);

                const keys = Object.keys(desc);
                if (keys.includes('value')) {
                    return desc.value;
                } else if (keys.includes('get')) {
                    return desc.get.call(obj);
                }

                break;

            case 4:
                return this.exec(children[1]);
                break;
        }
    }



    PrimaryExpression(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 1:
                return this.exec(children[0]);
                break;

            case 3:
                return this.exec(children[1]);
                break;
        }
    }
    Literal(node) {
        const { children } = node;
        return this.exec(children[0]);
    }
    NullLiteral(node) {

    }

    BooleanLiteral(node) {
        const bool = node.value;
        if (bool === 'true') {
            return !!1;
        } else if (bool === 'false') {
            return !!0;
        }
    }

    NumberLiteral(node) {
        const str = node.value;

        let len = str.length,
            i = 0,
            val = 0,
            base;

        const perfix = str.substring(0, 2);
        switch (perfix) {
            case '0b':
                base = 2;
                i = 2;
                break;

            case '0o':
                base = 8;
                i = 2;

                break;

            case '0x':
                base = 16;
                i = 2;

                break;

            default:
                base = 10;
        }

        let char, charCode, num;
        while (i < len) {
            char = str.charAt(i).toLowerCase();
            charCode = char.charCodeAt(0);
            if (perfix === '0x') {
                if (char >= 'a') {
                    num = charCode - 'a'.charCodeAt(0) + 10;
                }
            } else {
                num = charCode - '0'.charCodeAt(0);

            }
            val = val * base + num;
            i++;
        }

        console.log(val);
        return val;
    }

    StringLiteral(node) {
        const str = node.value,
            { length } = str,

            strArr = [];


        const singleEscapeMap = {
            "b": String.fromCharCode(0x0008),
            "t": String.fromCharCode(0x0009),
            "n": String.fromCharCode(0x000A),
            "v": String.fromCharCode(0x000B),
            "f": String.fromCharCode(0x000C),
            "r": String.fromCharCode(0x000D),
            '"': String.fromCharCode(0x0022),
            "'": String.fromCharCode(0x0027),
            "\\": String.fromCharCode(0x005c),
        }

        for (let i = 1; i < length - 1; i++) {
            const char = str[i];
            if (char === '\\') {
                i++;
                const char = str[i];
                if (singleEscapeMap[char]) {
                    strArr.push(singleEscapeMap[char]);
                } else {
                    strArr.push(char);

                }
                continue;

            }
            strArr.push(char);

        }

        const val = strArr.join('');
        console.log(strArr);
        console.log(val);
        return val;

    }

    ObjectLiteral(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 2:
                return {};
                break;

            case 3:
                const map = new Map;
                return this.PropertyList(children[1], map);
                break;
        }
    }

    PropertyList(node, obj) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 1:
                return this.Property(children[0], obj);
                break;

            case 3:
                this.PropertyList(children[0], obj);
                return this.Property(children[2], obj);
                break;
        }
    }

    Property(node, obj) {
        const { children } = node;
        let [key, p, value] = children;
        let name;
        switch (key.type) {
            case 'Identifier':
                name = key.value;
                break;

            case 'StringLiteral':
                name = this.StringLiteral(key);
                break;
        }

        obj.set(name, {
            value: this.exec(value),
            writable: true,
            enumerable: true,
            configurable: true,
        })

        return obj;

    }

    VarDeclaration(node) {
        const { children } = node;
        getCurrentExecStack().variableEnvironment[children[1].value] = void 0;

    }

    AssignmentExpression(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 1:
                return this.exec(children[0]);
                break;

            case 3:
                let value = this.exec(children[2]);
                let variable = this.exec(children[0]);

                return variable.set(value);
                break;
        }
    }

    Identifier(node) {
        const { value } = node;

        return new Reference(getCurrentExecStack().lexicalEnvironment, value);
    }

    IfStatement(node) {

        const { children } = node,
            condition = children[2],
            statement = children[4];

        let result = this.exec(condition);

        if (result instanceof Reference){
            result = result.get();
        }
        if(result){
            this.exec(statement);
        }

    }

}


