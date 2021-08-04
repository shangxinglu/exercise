
import { lexicalParse } from './lexicalParse.js'

const SYNTAX = {
    Program: [
        ['StatementList', 'EOF'],
    ],

    StatementList: [
        ['Statement'],
        ['StatementList', 'Statement'],
    ],

    Statement: [
        ['ExpressionStatement'],
        ['IfStatement'],
        ['ForStatement'],
        ['WhileStatement'],
        ['VarDeclaration'],
        ['FunctionDeclaration'],
    ],

    ExpressionStatement: [
        ['Expression', ';'],
    ],
    Expression: [
        ['AdditionExpression'],
    ],

    AdditionExpression: [
        ['MultiplicationExpression'],
        ['AdditionExpression', '+', 'MultiplicationExpression'],
        ['AdditionExpression', '-', 'MultiplicationExpression'],
    ],


    MultiplicationExpression: [
        ['PrimaryExpression'],
        ['MultiplicationExpression', '*', 'PrimaryExpression'],
        ['MultiplicationExpression', '/', 'PrimaryExpression'],
    ],
    PrimaryExpression: [
        ['(', 'Expression', ')'],
        ['Literal'],
        ['Identifier'],
    ],
    Literal: [
        ['NullLiteral'],
        ['BooleanLiteral'],
        ['NumberLiteral'],
        ["StringLiteral"],
    ],

    IfStatement: [
        ['if', '(', 'Expression', ')', 'Statement'],
    ],

    VarDeclaration: [
        ['var', 'Identifier', ';'],
        ['let', 'Identifier', ';'],
    ],
}

const hashTable = {};

const start = {
    Program: {},
}

/**
 * @description 对语法结构进行展开
 */
function closure(state) {
    const hash = JSON.stringify(state);
    hashTable[hash] = state;
    const queue = [];
    let current, currentRule;
    for (let item of Reflect.ownKeys(state)) {
        if (['reduceType', 'reduceLength'].includes(item)) continue;
        queue.push(item);
    }


    while (queue.length) {
        current = queue.shift();
        currentRule = SYNTAX[current];
        if (!currentRule) continue;

        // debugger
        for (let ruleArr of currentRule) {
            // const [rule] = ruleArr;
            if (!state[ruleArr[0]]) {
                queue.push(ruleArr[0]);
            }

            let currentState = state;

            for (let rule of ruleArr) {
                if (!currentState[rule]) {
                    currentState[rule] = {};
                }
                currentState = currentState[rule];
            }

            currentState.reduceType = current;
            currentState.reduceLength = ruleArr.length;

        }
    }

    const stateRule = Reflect.ownKeys(state);
    for (let item of stateRule) {
        if (['reduceType', 'reduceLength'].includes(item)) continue;

        let rule = state[item];
        const hash = JSON.stringify(rule);
        if (hashTable[hash]) {
            rule = hashTable[hash];
        } else {
            closure(rule);
        }
    }


}

closure(start);



export function syntaxParse(code) {
    const stack = [start];
    const tokenStack = [];
    function reduce() {
        let current = stack[stack.length - 1];
        if (current.reduceType) {
            const children = [];
            for (let i = 0; i < current.reduceLength; i++) {
                stack.pop();
                children.push(tokenStack.pop());

            }

            const token = {
                type: current.reduceType,
                children: children.reverse(),
            }

            return token;
        } else {
            // debugger
        }
    }

    function shift(token) {
        let current = stack[stack.length - 1];

        if (Reflect.ownKeys(current).includes(token.type)) {
            stack.push(current[token.type]);
            tokenStack.push(token);
        } else {
            shift(reduce());
            shift(token);
        }

    }
    for (let token of lexicalParse(code)) {
        shift(token);

    }


    return reduce();
}


const execObj = {
    Program(node) {
        const [child] = node.children;
        return exec(child);
    },
    StatementList(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 1:
                return exec(children[0]);
                break;

            case 2:
                exec(children[0]);
                return exec(children[1]);
                break;
        }
    },
    Statement(node) {
        const { children } = node;
        return exec(children[0]);

    },
    ExpressionStatement(node) {
        const { children } = node;
        return exec(children[0]);

    },
    Expression(node) {
        const { children } = node;
        return exec(children[0]);

    },
    AdditionExpression(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 1:
                return exec(children[0]);
                break;

            case 3:
                return exec(children[2]);
                break;
        }
    },

    MultiplicationExpression(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 1:
                return exec(children[0]);
                break;

            case 3:
                return exec(children[2]);
                break;
        }
    },
    PrimaryExpression(node) {
        const { children } = node,
            { length } = children;
        switch (length) {
            case 1:
                return exec(children[0]);
                break;

            case 3:
                return exec(children[1]);
                break;
        }
    },
    Literal(node) {
        const { children } = node;
        return exec(children[0]);
    },
    NullLiteral(node) {

    },
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
    },
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

    },
    VarDeclaration(node) {
        const { children } = node;
        console.log('VarDeclaration', children[1].value);
    }
}

function exec(node) {
    return execObj?.[node.type]?.(node);
}

const textEl = document.getElementById('text');
const runEl = document.getElementById('run');

runEl.addEventListener('click', () => {
    const code = textEl.value;
   
    const tree = syntaxParse(code);

    exec(tree);
})

// const code = `
//     '1';
// `;

// const tree = syntaxParse(code);

// exec(tree);
