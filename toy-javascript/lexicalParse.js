

const regexpObj = {
    Program: 'WhiteSpace|LineTerminator|Comment|Token',
    WhiteSpace: / /,
    LineTerminator: /\r|\n/,
    Comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\//,
    Token: 'Literal|Keyword|Identifier|Punctuator',
    Literal: 'BooleanLiteral|NumberLiteral|StringLiteral|NullLiteral',
    BooleanLiteral: /true|false/,
    NumberLiteral: /0b[01]*|0o[0-7]*|0x[0-9a-fA-F]*|(?:[1-9][0-9]*|[0-9])(?:\.[0-9]+)?/,
    StringLiteral: /'(?:[^'])*?'|"(?:[^"])*?"/,
    NullLiteral: /null/,
    Keyword: /var|let|const|if|else[\s]+if|else|switch|case|return|for|while|break|continue|new/,
    Identifier: /[A-Za-z$_][A-Za-z0-9$_]*/,
    Punctuator: /\|\||\&\&|\(|\)|\{|\}|;|\:|\.|\[|\]|\+|\-|\*|\/|\+\+|\-\-|\=|\=\=|\=\=\=|\>|\<|\,|\!/,
}

export function genRegexp(entry) {

    // 字符串分割，遍历查找对象的属性，
    // 如果是正则替换，
    // 如果是字符串，重复以上步骤
    function mergeRegexp(entry) {
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





const regexp = genRegexp('Program');

export function* lexicalParse(code){
    let match;
    while (match = regexp.exec(code)) {
        const { groups } = match;
        const [value] = match;

    
        if (groups.WhiteSpace) {
            // yield {
            //     type:'WhiteSpace',
            //     value,
            // };
        } else if (groups.LineTerminator) {
            // yield {
            //     type:'LineTerminator',
            //     value,
            // };
    
        } else if (groups.Comment) {
            // yield {
            //     type:'Comment',
            //     value,
            // };
    
        } else if (groups.BooleanLiteral) {
            yield {
                type:'BooleanLiteral',
                value,
            };
    
        } else if (groups.NumberLiteral) {
            yield {
                type:'NumberLiteral',
                value,
            };
    
        } else if (groups.StringLiteral) {
            yield {
                type:'StringLiteral',
                value,
            };
    
        } else if (groups.NullLiteral) {
            yield {
                type:'NullLiteral',
                value,
            };
    
        }else if (groups.Identifier) {
            yield {
                type:'Identifier',
                value,
            };
    
        } else if (groups.Keyword) {
            yield {
                type:value,
            };
    
        }  else if (groups.Punctuator) {
            yield {
                type:value,
            };
    
        }

    }

    yield {
        type:'EOF'
    }
}

