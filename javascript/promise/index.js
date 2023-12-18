/**
 * @description 手动实现一个Promise
 */

class MyPromise {
    constructor(executor) {
        if(typeof executor !== 'function') {
            throw new TypeError(`Promise resolver ${executor} is not a function`)
        }

        this.state = 'pending'
        this.value
        this.reason
        this.onFulfilledCallback = []
        this.onRejectedCallback = []

        executor(this.resove, this.rejected)

    }

    resove(value){
        queueMicrotask(() => {
            if(this.state !== 'pending') return
            this.state = 'fulfilled'
            this.value = value
            this.onFulfilledCallback.forEach(fn => fn(value))
        })
     

    }

    rejected(reason){
        queueMicrotask(() => {
        if(this.state !== 'pending') return
        this.state = 'rejected'
        this.reason = reason
        this.onRejectedCallback.forEach(fn => fn(reason))
        })

    }

    then(onFulfilled,onRejected){
        
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : error => {throw error}

        let promise2

        if(this.state === 'fulfilled') {
          promise2= new MyPromise((resolve, reject) => {
                queueMicrotask(()=>{
                    try{
                        const result = onFulfilled(this.value)
                        resolve(result)
                    } catch(error) {
                        reject(error)
                    }
                                                                       
                })
          })
        }

        if(this.state === 'rejected') {
            promise2= new MyPromise((resolve,reject)=>{
                queueMicrotask(()=>{
                    try{
                        const result = onRejected(this.reason)
                        resolve(result)
                    } catch(error) {
                        reject(error)
                    }

                })
            })
        }

        if(this.state === 'pending') {
            promise2 = new MyPromise((resolve,reject)=>{
                this.onFulfilledCallback.push(value => {
                    try{
                        const result = onFulfilled(value)
                        resolve(result)
                    } catch(error) {
                        reject(error)
                    }
                })

                this.onRejectedCallback.push(reason => {
                    try{
                        const result = onRejected(reason)
                        resolve(result)
                    } catch(error) {
                        reject(error)
                    }
                })

            })
        }
    }

    // 放入微队列


}


const p1 = new Promise((resolve, reject) => {
    resolve(1)
}).then()

p1.then((res) => {
    console.log(res)
})