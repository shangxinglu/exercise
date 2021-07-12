
const css = require('css');
const layout = require('./layout.js');

const letterReg = /[A-Za-z]/, // 字母
    attrReg = /[A-Za-z\-]/, //属性
    spaceReg = /[\n\t\f ]/; // 空格匹配

let tagName = '', // 标签名
    isCloseTag = false, // 自闭合标签
    attrName = '', // 属性名
    attrValue = '', // 属性值
    attrQuotes = '', // 属性引号
    text = ''; // 文本

const stack = [{ type: 'document', children: [] }];

const cssRule = []; // CSS解析后的规则

let attrObj = {};

function VNode(tag, attr) {
    return {
        tag,
        attr,
        children: [],
    }
}

function textVNode(text) {
    return {
        text,
    };
}

// 解析完一个开始标签触发
function hookStart(tag, attr, isCloseTag = false) {
    const vnode = VNode(tag, attr);
    const currentNode = stack[stack.length - 1];
    vnode.parent = currentNode;
    currentNode.children.push(vnode);


    if (isCloseTag) {
        matchRule(vnode);
        return;
    }

    stack.push(vnode);
    matchRule();


}

// 解析完一个结束标签触发
function hookEnd(tag) {
    console.log('end', tag);

    const vnode = stack.pop();
    if (tag === 'style') {
        parseCSS(vnode.children[0].text);
    }

    layout(vnode);
    
    if (vnode.tag !== tag) {
        throw new Error(vnode.tag + '缺少闭合标签')
    }
}

// 解析到一个文本触发
function hookText(text) {
    console.log('text', text);
    if (/^\s+$/.test(text)) return;
    const textVnode = textVNode(text);
    const currentNode = stack[stack.length - 1];
    currentNode.children.push(textVnode);
}

// 解析CSS
function parseCSS(text) {
    const rule = css.parse(text);
    cssRule.push(...rule.stylesheet.rules);
}

// CSS规则匹配
function matchRule(node) {
    const tempList = stack.slice().reverse();
    if (node) {
        tempList.unshift(node);
    }
    for (let rule of cssRule) {
        const nodeList = tempList.slice();
        const result = matchSingleRule(rule, nodeList);
        if (result) {
            if (!tempList[0].computedStyle) {
                tempList[0].computedStyle = {};
            }
            const computed = computedStyle(rule);

            Object.assign(tempList[0].computedStyle,computed)
        }
    }
}

// 匹配单条规则
function matchSingleRule(rule, nodeList) {
    let node = nodeList.shift();
    const selector = rule.selectors[0].split(' ').reverse();

    // 匹配单条规则
    for (let i = 0, len = selector.length; i < len; i++) {
        let item = selector[i];
        let isMatch = matchSelector(item, node);

        while (!isMatch) {
            if (i === 0) return;

            node = nodeList.shift();
            if (!node) return;

            isMatch = matchSelector(item, node);
        }

        node = nodeList.shift();

    }

    return true;
}

// 匹配选择器
function matchSelector(selector, node) {
    if (!node) return false;

    let classArr;
    switch (selector.charAt(0)) {
        case '#':
            selector = selector.substring(1);
            if (node.attr.id !== selector) return;
            break;

        case '.':
            selector = selector.substring(1);
            classArr = node.attr.class?.split?.(' ') || [];
            if (!classArr.includes(selector)) return;
            break;

        default:
            if (selector !== node.tag) return;
    }

    return true;

}


// 计算样式
function computedStyle(rule) {
    const { declarations } = rule;

    const style = {};
    for (let item of declarations) {
        const { property, value } = item;
        style[property] = value;
    }

    return style;
}

function parseHTML(body) {
    let status = start;

    for (let c of body) {
        status = status(c);
    }

    return stack[0];
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
        hookStart(tagName, attrObj);
        tagName = '';
        attrObj = {};
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
        hookStart(tagName, attrObj, isCloseTag);
        tagName = '';
        attrObj = {};
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
        hookStart(tagName, attrObj);
        tagName = '';
        attrObj = {};
        return start;
    }

    if (attrReg.test(char)) {
        attrName += char;
        return parseAttrName;
    }

    if (spaceReg.test(char)) {
        if (attrName) {
            attrObj[attrName] = null;
            attrName = '';

        }

        return parseAttrName;
    }

}

// 解析属性值
function parseAttrValue(char) {
    if (['\'', '"'].includes(char)) {
        if (attrQuotes) {
            if (attrQuotes === char) {
                attrObj[attrName] = attrValue;
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