//使用状态机完成”abababx”的处理

function match(str) {
    let status = start;
    for (let item of str) {
        status = status(item);
    }

    return status === end;
}

function start(char) {
    if (char === 'a') {
        return B;
    }

    return start;
}

function B(char) {
    if (char === 'b') {
        return A1;
    }

    return start(char);
}

function A1(char) {
    if (char === 'a') {
        return B1;
    }

    return start(char);
}

function B1(char) {
    if (char === 'b') {
        return A2;
    }

    return start(char);
}
function A2(char) {
    if (char === 'a') {
        return B2;
    }

    return start(char);
}
function B2(char) {
    if (char === 'b') {
        return X;
    }

    return start(char);
}

function X(char) {
    
    if (char === 'x') {
        return end;
    } else if(char==='a'){
        return B2;
    }

    return start(char);
}

function end() {
    return end;
}

console.log(match('abababababababx'));

