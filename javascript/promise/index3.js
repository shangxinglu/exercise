const resolvePromise = (promise2, result, resolve, reject) => {
    // 当 result 和 promise2 相等时，也就是说 onfulfilled 返回 promise2 时，进行 reject
    if (result === promise2) {
      reject(new TypeError('error due to circular reference'))
    }
  
    // 是否已经执行过 onfulfilled 或者 onrejected
    let consumed = false
    let thenable
  
    if (result instanceof MyPromise) {
      if (result.status === 'pending') {
        result.then(function(data) {
          resolvePromise(promise2, data, resolve, reject)
        }, reject)
      } else {
        result.then(resolve, reject)
      }
      return
    }
  
    let isComplexResult = target => (typeof target === 'function' || typeof target === 'object') && (target !== null)
  
    // 如果返回的是疑似 Promise 类型
    if (isComplexResult(result)) {
      try {
        thenable = result.then
        // 如果返回的是 Promise 类型，具有 then 方法
        if (typeof thenable === 'function') {
          thenable.call(result, function(data) {
            if (consumed) {
              return
            }
            consumed = true
  
            return resolvePromise(promise2, data, resolve, reject)
          }, function(error) {
            if (consumed) {
              return
            }
            consumed = true
  
            return reject(error)
          })
        }
        else {
          resolve(result)
        }
  
      } catch(e) {
        if (consumed) {
          return
        }
        consumed = true
        return reject(e)
      }
    }
    else {
      resolve(result)
    }
}

function MyPromise(execute) {
    this.status = "pending";
    this.value = null;
    this.reason = null;

    this.onFulfilledArray = [];
    this.onRejectedArray = [];
    
    const resolve = (value) => {
        queueMicrotask(() => {
            if(this.status === "pending") {
                this.value = value;
                this.status = "fulfilled";
                this.onFulfilledArray.forEach(func => func(value))
            }
        })
    }
    
    const reject = (reason) => {
        queueMicrotask(() => {
            if(this.status === "pending") {
                this.reason = reason;
                this.status = "rejected";
                this.onRejectedArray.forEach(func => func(reason))
            }
        })
    }
    // try catch 
    execute(resolve, reject);
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled: (data) => { return data };
    onRejected = typeof onRejected === "function" ? onRejected: (error) => { throw error };
    
    let promise2;

    if(this.status === "fulfilled") {
        return promise2 = new MyPromise((resolve, reject) => {
            queueMicrotask(() => {
                try {
                    // promise1 中 onfulfilled 返回了一个值，这个值需要被 promise2 进行 resolve ，才能出现在下一个 then(res)
                    let x = onFulfilled(this.value);
                    resolvePromise(promise2, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            })
        })
        
    }
    
    if(this.status === "rejected") {
        return promise2 = new MyPromise((resolve, reject) => {
            queueMicrotask(() => {
                try {
                    // promise1 中 onfulfilled 返回了一个值，这个值需要被 promise2 进行 resolve ，才能出现在下一个 then(res)
                    let x = onRejected(this.reason);
                    resolvePromise(promise2, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            })
        })
    }

    if(this.status === "pending") {
        return promise2 = new MyPromise((resolve, reject) => {
            this.onFulfilledArray.push(() => {
                try {
                    let x = onFulfilled(this.value);
                    resolvePromise(promise2, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            });
            this.onRejectedArray.push(() => {
                try {
                    // promise1 中 onfulfilled 返回了一个值，这个值需要被 promise2 进行 resolve ，才能出现在下一个 then(res)
                    let x = onRejected(this.reason);
                    resolvePromise(promise2, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            });
        })
        
    }
}