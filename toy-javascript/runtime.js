import {
    JSUndefined,
    JSNull,
    JSBoolean,
    JSNumber,
    JSString,
    JSObject,
    JSSymbol,
} from "./type.js";

// 与window绑定的领域
export class Realm {
    constructor() {
        this.Global = new Map;
        this.Object = new Map;
        this.ObjectPrototype = new Map;
    }
}

// 环境记录
export class EnvironmentRecord {
    constructor(outer) {
        this.variable = new Map;
        this.outer = outer;
    }

    add(name) {
        this.variable.set(name, new JSUndefined);

    }

    set(name, value = new JSUndefined) {
        if (this.variable.has(name)) {
            return this.variable.set(name, value);
        } else if (this.outer) {
            return this.outer.set(name, value);
        } else {
            return this.variable.set(name, value);
        }

    }

    get(name) {
        if (this.variable.has(name)) {
            return this.variable.get(name);
        } else if (this.outer) {
            return this.outer.get(name);
        }

        return new JSUndefined;
    }
}

export class ObjectEnvironmentRecord {
    constructor(obj) {
        this.object = obj;
    }

    add(name) {
        this.object.set(name, new JSUndefined);

    }

    set(name, value = new JSUndefined) {

        this.object.set(name, value);
    }

    get(name) {
        return this.object.get(name);

    }
}



// 完成记录
export class CompletionRecord {
    constructor(type, value, target) {
        this.type = type || 'normal';
        this.value = value || new JSUndefined;
        this.target = target || new JSNull;
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
        object.set(property, value);
    }

    get() {
        const { object, property } = this;

        return object.get(property);
    }
}

// 解除引用
function dismiss(ref) {
    if (ref instanceof Reference) {
        ref = ref.get();
    }

    return ref;
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
                const completeRecord = this.exec(children[0]);
                if (completeRecord.type === 'normal') {
                    return this.exec(children[1]);
                }
                return completeRecord;
                break;
        }
    }

    Statement(node) {
        const { children } = node;
        return this.exec(children[0]);
    }

    BlockStatement(node) {
        const { children } = node,
            { length } = children;

        switch (length) {
            case 2:
                return;
                break;

            case 3:
                const { realm, lexicalEnvironment, variableEnvironment } = getCurrentExecStack();
                const context = new ExecutionContext(realm,
                    new EnvironmentRecord(lexicalEnvironment),
                    new EnvironmentRecord(variableEnvironment)
                );
                pushExecStack(context);
                const result = this.exec(children[1]);
                popExecStack();

                return result;
                break;
        }
    }

    BreakStatement(node) {
        return new CompletionRecord('break');
    }

    ContinueStatement(node) {
        return new CompletionRecord('continue');
    }

    ExpressionStatement(node) {
        const { children } = node;
        let result = this.exec(children[0]);
        // debugger
        if (result instanceof Reference) {
            result = result.get();
        }
        return new CompletionRecord('normal', result);
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

                if (left instanceof Reference) {
                    left = left.get();
                }

                if (right instanceof Reference) {
                    right = right.get();
                }

                if (operator === '+') {
                    return new JSNumber(left.value + right.value);
                } else if (operator === '-') {
                    debugger
                    return new JSNumber(left.value - right.value);
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

    CallExpression(node) {
        const { children } = node;

        let fun = this.exec(children[0]),
            args = this.exec(children[1]);

        if (fun instanceof Reference) {
            fun = fun.get();
        }

        return fun.call(args);
    }

    Arguments(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 2:
                return [];
                break;

            case 3:

                return this.exec(node.children[1]);

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

    ArgumentsList(node) {
        const { children } = node,
            { length } = children;

        let result;

        switch (length) {
            case 1:
                result = this.exec(children[0]);
                result = dismiss(result);
                return [result];
                break;

            case 3:
                result = this.exec(children[2]);
                result = dismiss(result);

                return this.exec(children[0]).concat(result);

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
            return new JSBoolean(true);
        } else if (bool === 'false') {
            return new JSBoolean(false);

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

        // console.log(val);
        return new JSNumber(val);
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
        getCurrentExecStack().lexicalEnvironment.add(children[1].value);
        return new CompletionRecord('normal', new JSUndefined);

    }

    FunctionDeclaration(node) {
        const { children } = node,
            { length } = children;
        const identifier = children[1].value,
            code = children[length - 2];

        const fun = new JSObject;

        fun.call = args => {
            const newCtx = new ExecutionContext(this.realm,
                new EnvironmentRecord(fun.environment),
                new EnvironmentRecord(fun.environment));
                
            pushExecStack(newCtx);
            this.exec(code);
            popExecStack();
        }

        const context = getCurrentExecStack();
        fun.environment = context.lexicalEnvironment;
        context.lexicalEnvironment.set(identifier, fun);


        return new CompletionRecord('normal');
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

        if (result instanceof Reference) {
            result = result.get();
        }
        if (result.toBoolean().value) {
            this.exec(statement);
        }

    }

    WhileStatement(node) {
        const { children } = node,
            condition = children[2],
            statement = children[4];
        while (true) {
            let result = this.exec(condition);

            if (result instanceof Reference) {
                result = result.get();
            }
            if (result.toBoolean().value) {
                const completionRecord = this.exec(statement);
                if (completionRecord.type === 'continue') continue;

                if (completionRecord.type === 'break') return new CompletionRecord('normal')
            } else {
                break;
            }
        }


    }


}


