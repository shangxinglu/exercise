

const regexpObj = {
    Program: 'WhiteSpace|LineTerminator|Comment|Token',
    WhiteSpace: / /,
    LineTerminator: /\r|\n/,
    Comment: /\/\/|\/\*[\s\S]*?\*\//,
    Token: 'Literal|Keyword|Identifier|Punctuator',
    Literal: 'BooleanLiteral|NumberLiteral|StringLiteral|NullLiteral',
    BooleanLiteral: /true|false/,
    NumberLiteral: /(?:[0-9]|[1-9][0-9]*)(?:\.[0-9]+)?/,
    StringLiteral: /'(?:[^']|\\')*?'|"(?:[^"]|\\")*?"/,
    NullLiteral: /null/,
    keyword: /var|let|const|if|else[\s]+if|else|switch|case|return|for|while|break|continue/,
    Identifier: /[A-Za-z$_][A-Za-z0-9$_]*/,
    Punctuator: /\(|\)|\{|\}|;|\:|\.|\[|\]|\+|\-|\*|\/|\+\+|\-\-|\=|\=\=|\=\=\=|\>|\<|\,|\!/,
}

/**
    函数职责
        字符串分割，遍历查找对象的属性，
        如果是正则替换，
        如果是字符串，重复以上步骤
 */

function mergeRegexp(obj, entry) {
    let regepxStr = '';
    let current = obj[entry], matchArr = [];

    if (typeof current === 'string') {

        for (let item of current.split('|')) {
            let child = obj[item];
            if (child instanceof RegExp) {
                matchArr.push(`(?<${item}>${child.source})`);
            }

            if (typeof child === 'string') {
                matchArr.push(mergeRegexp(obj, item));
            }
        }

        regepxStr = matchArr.join('|');

    }

    return regepxStr;
}

const regexp= new RegExp(mergeRegexp(regexpObj, 'Program'),'g');


const code = `
send(connect) {
    return new Promise((resolve, reject) => {

        if (connect) {
            connect.write(this.toString());
        } else {
            connect = net.createConnection({
                port: this.port,
                host: this.host,
            }, () => {
                console.log('createConnect');
                connect.write(this.toString());

            });
        }

        connect.on('data', chunk => {
            console.log('data', chunk.toString());
            const response = new Response;

            response.receiver(chunk.toString());
            resolve(response.getResponse());
        })

        connect.on('error', error => {
            console.log('error', error);
            reject(error);
            connect.end();
        })
    })


}

`;

let match;
while(match = regexp.exec(code)){
   debugger
    document.write(match[0]);
}
