define(['test1'],function(require,exports,module ){
    
    console.log(require,exports,module);
    const test = function(a,b){
        return a+b;
    }

    
    // exports.test = test;
    return {
        test
    }
})