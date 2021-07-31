
const SYNTAX = {
    Program: [
        ['StatementList'],
    ],

    StatementList: [
        ['Statement'],
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
        ['NumerIteral']
    ],

    IfStatement: [
        ['if', '(', 'Expression', ')', 'Statement'],
    ],

    VarDeclaration: [
        ['var', 'let', 'identifier']
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
    const queue = Reflect.ownKeys(state);
    let current, currentRule;

    while (queue.length) {
        current = queue.shift();
        currentRule = SYNTAX[current];
        if (!currentRule) {
            continue;
        }
        for (let ruleArr of currentRule) {
            // const [rule] = ruleArr;
            let current = state;
            const record = [];

            for (let rule of ruleArr) {
                if (record.includes(rule)) continue;

                if (!current[rule]) {
                    current[rule] = {};

                    record.push(rule);
                    queue.push(rule);
                    console.log(rule);
                }
                current = current[rule];

            }

        }
    }

    const stateRule = Reflect.ownKeys(state);
    for(let item of stateRule){
        let rule = state[item];
        const hash = JSON.stringify(rule);
        if(hashTable[hash]){
            rule = hashTable[hash];
        } else {
            closure(rule);
        }
    }
}

closure(start);


