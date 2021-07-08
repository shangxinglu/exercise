
const letterReg = /[A-Za-z]/, // 字母
    attrReg = /[A-Za-z\-]/, //属性
    spaceReg = /[\n\t\f ]/; // 空格匹配

let tagName = '', // 标签名
    isCloseTag = false, // 自闭合标签
    attrName = '', // 属性名
    attrValue = '', // 属性值
    attrQuotes = '', // 属性引号
    text = ''; // 文本

const stack = [];

let attrArr = [];

// 解析完一个开始标签触发
function hookStart(tag) {
    console.log('start', tag);
}

// 解析完一个结束标签触发
function hookEnd(tag) {
    console.log('end', tag);
}

// 解析到一个文本触发
function hookText(text) {
    console.log('text', text);
}

function parseHTML(body) {
    let status = start;

    for (let c of body) {
        status = status(c);
    }

}

// 开始解析
function start(char) {
    if (char === '<') {
        if (text) {
            hookText(text);
            text = '';
        }

        return parseTagName;
    }

    text += char;

    return start;
}


// 解析标签名
function parseTagName(char) {
    if (char === '/') {
        if (tagName) {
            isCloseTag = true;
            return parseTagClose;
        }

        return parseTagEnd;

    }

    if (char === '>') {
        hookStart(tagName);
        tagName = '';
        attrArr = [];
        return start;
    }

    if (letterReg.test(char)) {
        tagName += char;

        return parseTagName;
    }

    if (spaceReg.test(char)) {
        return parseAttrName;
    }

}

// 解析标签闭合
function parseTagClose(char) {
    if (letterReg.test(char)) {
        tagName += char;

        return parseTagClose;
    }

    if (char === '>') {
        hookStart(tagName, isCloseTag);
        attrArr = [];
        isCloseTag = false;
        return start;
    }
}

// 解析结束标签
function parseTagEnd(char) {
    if (letterReg.test(char)) {
        tagName += char;

        return parseTagEnd;
    }

    if (char === '>') {
        hookEnd(tagName);
        tagName = '';
        return start;
    }
}



// 解析属性名
function parseAttrName(char) {
    if (char === '=') {
        return parseAttrValue;
    }

    if (char === '/') {
        if (tagName) {
            isCloseTag = true;
            return parseTagClose;
        }

        return parseTagEnd;

    }

    if (char === '>') {
        hookStart(tagName);
        tagName = '';
        attrArr = [];
        return start;
    }

    if (attrReg.test(char)) {
        attrName += char;
        return parseAttrName;
    }

    if (spaceReg.test(char)) {
        if (attrName) {
            attrName = '';
            attrArr.push(attrName);

        }

        return parseAttrName;
    }

}

// 解析属性值
function parseAttrValue(char) {
    if (['\'', '"'].includes(char)) {
        if (attrQuotes) {
            if (attrQuotes === char) {
                attrArr.push(`${attrName}="${attrValue}"`);
                attrName = '',
                    attrValue = '',
                    attrQuotes = '';

                return parseAttrName;

            } else {
                attrValue += char;
                return parseAttrValue;
            }

        }

        attrQuotes = char;
        return parseAttrValue;

    }

    attrValue += char;
    return parseAttrValue;
}








module.exports = {
    parseHTML,
}