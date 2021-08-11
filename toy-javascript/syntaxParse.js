
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
        ['BlockStatement'],
        ['ExpressionStatement'],
        ['IfStatement'],
        ['ForStatement'],
        ['WhileStatement'],
        ['VarDeclaration'],
        ['FunctionDeclaration'],
        ['BreakStatement'],
        ['ContinueStatement'],
    ],
    BlockStatement:[
        ['{','}'],
        ['{','StatementList','}'],
    ],

    BreakStatement:[
        ['break',';'],
    ],
    ContinueStatement:[
        ['continue',';'],
    ],

    ExpressionStatement: [
        ['Expression', ';'],
    ],
    Expression: [
        ['AssignmentExpression'],
    ],
    AssignmentExpression: [
        ['LogicalORExpression'],
        ['LeftHandSideExpression', '=', 'LogicalORExpression'],
    ],
    LogicalORExpression: [
        ['LogicalANDExpression'],
        ['LogicalORExpression', '||', 'LogicalANDExpression'],
    ],
    LogicalANDExpression: [
        ['AdditionExpression'],
        ['LogicalANDExpression', '&&', 'AdditionExpression'],
    ],
    AdditionExpression: [
        ['MultiplicationExpression'],
        ['AdditionExpression', '+', 'MultiplicationExpression'],
        ['AdditionExpression', '-', 'MultiplicationExpression'],
    ],


    MultiplicationExpression: [
        ['LeftHandSideExpression'],
        ['MultiplicationExpression', '*', 'LeftHandSideExpression'],
        ['MultiplicationExpression', '/', 'LeftHandSideExpression'],
    ],

    LeftHandSideExpression: [
        ['CallExpression'],
        ['NewExpression'],
    ],

    CallExpression: [
        ['MemberExpression', 'Arguments'],
        ['CallExpression', 'Arguments'],
    ],

    NewExpression: [
        ['MemberExpression'],
        ['new', 'NewExpression'],
    ],

    MemberExpression: [
        ['PrimaryExpression'],
        ['PrimaryExpression', '.', 'Identifier'],
        ['PrimaryExpression', '[', 'Expression', ']'],
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
        ["ObjectLiteral"],
    ],
    ObjectLiteral: [
        ['{', '}'],
        ['{', 'PropertyList', '}'],
    ],

    PropertyList: [
        ['Property'],
        ['PropertyList', ',', 'Property'],
    ],
    Property: [
        ['StringLiteral', ':', 'AdditionExpression'],
        ['Identifier', ':', 'AdditionExpression'],
    ],

    IfStatement: [
        ['if', '(', 'Expression', ')', 'Statement'],
    ],
    WhileStatement:[
        ['while','(','Expression',')','BlockStatement'],
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
            const [rule] = ruleArr;
            if (!state[rule]) {
                queue.push(rule);
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
            state[item] = hashTable[hash];
        } else {
            closure(rule);
        }
    }


}

closure(start);

// debugger


export default function syntaxParse(code) {
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
            throw new Error('reduceType不存在')
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
