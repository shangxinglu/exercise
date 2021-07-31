

const regexpObj = {
    Program: 'WhiteSpace|LineTerminator|Comment|Token',
    WhiteSpace: / /,
    LineTerminator: /\r|\n/,
    Comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\//,
    Token: 'Literal|Keyword|Identifier|Punctuator',
    Literal: 'BooleanLiteral|NumberLiteral|StringLiteral|NullLiteral',
    BooleanLiteral: /true|false/,
    NumberLiteral: /(?:[0-9]|[1-9][0-9]*)(?:\.[0-9]+)?/,
    StringLiteral: /'(?:[^'])*?'|"(?:[^"])*?"/,
    NullLiteral: /null/,
    keyword: /var|let|const|if|else[\s]+if|else|switch|case|return|for|while|break|continue/,
    Identifier: /[A-Za-z$_][A-Za-z0-9$_]*/,
    Punctuator: /\(|\)|\{|\}|;|\:|\.|\[|\]|\+|\-|\*|\/|\+\+|\-\-|\=|\=\=|\=\=\=|\>|\<|\,|\!/,
}

function genRegexp( entry) {

    // 字符串分割，遍历查找对象的属性，
    // 如果是正则替换，
    // 如果是字符串，重复以上步骤
    function mergeRegexp( entry) {
        let regepxStr = '';
        let current = regexpObj[entry], matchArr = [];

        if (typeof current === 'string') {

            for (let item of current.split('|')) {
                let child = regexpObj[item];
                if (child instanceof RegExp) {
                    matchArr.push(`(?<${item}>${child.source})`);
                }

                if (typeof child === 'string') {
                    matchArr.push(mergeRegexp(item));
                }
            }

            regepxStr = matchArr.join('|');

        }

        return regepxStr;
    }

    const regexp = new RegExp(mergeRegexp(entry), 'g');

    return regexp;

}



const code = `

// 注释
/*
注释
*/
let a = 'str';
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

const regexp = genRegexp(regexpObj, 'Program');


let match;
while (match = regexp.exec(code)) {
    const { groups } = match;

    if (groups.WhiteSpace) {

    } else if (groups.LineTerminator) {

    } else if (groups.Comment) {

    } else if (groups.NumberLiteral) {

    } else if (groups.StringLiteral) {

    } else if (groups.NullLiteral) {

    } else if (groups.keyword) {

    } else if (groups.Identifier) {

    } else if (groups.Punctuator) {

    }
}
