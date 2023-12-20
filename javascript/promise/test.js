
const generatorPromise = (num)=>{
    return Array(num).fill(0).map((item,index)=>{
        return ()=> new Promise((resolve,reject)=>{
            setTimeout(()=>{
                console.log(index)
                resolve(index)
            },Math.random()*1000)
        })
    })
}

const arr1 = generatorPromise(10)

const promiseChain = (arr)=>{
    return arr.reduce((pre,cur)=>{
        return pre.then(()=>{
            return cur()
    })
    },Promise.resolve())
}

promiseChain(arr1).then((res)=>{
    console.log(res)
})
