
const letterReg = /[A-Za-z]/, // 字母
     attrReg = /[A-Za-z]/, //属性
     spaceReg = /[\n\t\f ]/; // 空格匹配

let tagName = '', // 标签名
    attrName = '', // 属性名
    attrValue='', // 属性值
    text = ''; // 文本


function parseHTML(body) {
    let status = parseTagOpen;
    for (let c of body) {
        status = status(c);
    }
}

// 开始解析
function start(char){
    if(char==='<'){
        return parseTagName;
    }

    text+=char;

    return start;
}

// 解析标签闭合
function parseTagClose(char){
    if(letterReg.test(char)){
        tagName+=char;

        return parseTagClose;
    }

    if(char === '>') return start;
}

// 解析结束标签
function parseTagEnd(){
    if(letterReg.test(char)){
        tagName+=char;

        return parseTagEnd;
    }

    if(char ==='>') return start;
}

// 解析标签名
function parseTagName(char){
    if(char==='/') return parseTagEnd;

    if(letterReg.test(char)){
        tagName+=char;

        return parseTagName;
    }

    return parseSpace;
}


// 解析空格
function parseSpace(char){
    if(spaceReg.test(char)){
        return parseSpace;
    }

    if(letterReg.test(char)){
        attrName+=char;
        return parseAttrName;
    }

    if(char==='/') return parseTagClose;
}

// 解析属性名
function parseAttrName(char){
    
}

// 解析属性值
function parseAttrValue(value){

}








module.exports = {
    parseHTML,
}