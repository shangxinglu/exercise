



class KMP {
    constructor(target) {
        this.target = target;
        this.matchTable = this.createMatchTable(target);

    }

    // 匹配目标字符串
    match(source) {
        const { target } = this,
        result = [];

        let tIndex = 0;
        for (let i = 0, len = source.length; i < len; i++) {
            let sChar = source[i],
                tChar = target[tIndex];

            if (sChar === tChar) {
                tIndex++;
                if(tIndex===target.length){
                    result.push(i-target.length+1);
                    tIndex = 0;
                }
                continue;
            }

            if (tIndex === 0) {
                continue;
            } else {
                tIndex = this.backFind(tIndex, sChar);
            }

        }

        return result;
    }


    // 根据匹配表进行前移重匹配
    backFind(tIndex, sChar) {
        const { target, matchTable } = this;
        let tChar;
        do {
            const matchLen = tIndex,
            repeatLen = matchTable[matchLen-1];

            tIndex -= matchLen - repeatLen; // 根据已匹配长度和重复长度进行前移

            if(tIndex===0) return 0;
            tChar = target[tIndex];

            
        } while (tChar !== sChar);

        return tIndex;


    }



    // 创建匹配表
    createMatchTable(str) {
        const table = Array(str.length).fill(0);

        for (let i = 0, len = str.length; i < len; i++) {
            const substr = str.substring(0, i + 1);
            let subTable = this.findRepeatLength(substr);

            if (subTable) {
                for (let j = 0, len = subTable.length; j < len; j++) {
                    let item = subTable[j];
                    if (item > 0) {
                        table[j] = item;
                    }
                }
            }
        }

        return table;

    }

    /**
     * @description 寻找字符串前后拽的重复长度
     * 
     * @param {String} str 寻找的字符串
     * 
     * @returns {Boolean|Array} 如果不存在重复返回false，不然返回匹配数组
     */
    findRepeatLength(str) {
        const preArr = [],
            sufArr = [];
        const table = Array(str.length).fill(0);

        let isExist = false;

        for (let i = 0, len = str.length; i < len; i++) {
            let pre = str.substring(0, i + 1),
                suf = str.substring(i, len);

            if (i === 0) {
                preArr.push(pre);
                continue;
            } else if (i === len - 1) {
                sufArr.push(suf);
                continue;
            }

            preArr.push(pre);
            sufArr.push(suf);
        }

        for (let item of preArr) {
            let index = sufArr.indexOf(item);
            if (index > -1) {
                isExist = true;
                index += item.length
                table[index] = item.length;
            }
        }

        return isExist && table;

    }


}



const kmp = new KMP('abcdabe');

console.log(kmp.match('123456abcdabefabvdfabcdabeabcdabe'));

