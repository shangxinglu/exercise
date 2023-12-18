/**
 * @description 手动实现一个完整版的promise
 */
const resolvePromise = (promise2, x, resolve, reject) => {
  if (promise2 === x) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    );
  }
  if (x instanceof MyPromise) {
    if (x.state === "pending") {
      x.then(
        (y) => {
          resolvePromise(promise2, y, resolve, reject);
        },
          reject
      );
    } else {
      x.then(resolve, reject);
    }

    return;
  }

  const isComplexResult = (target) =>
    (typeof target === "object" || typeof target === "function") &&
    target !== null;

  if (isComplexResult(x)) {
    try {
      thenable = x.then;

      if (typeof thenable === "function") {
        thenable.call(
          x,
          (y) => {
            resolvePromise(promise2, y, resolve, reject);
          },
          (reason) => {
            reject(reason);
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      reject(error);
    } 
  }else {
    resolve(x);
}
};

class MyPromise {
  state = "pending";
  value;
  reason;
  onFulfilledCallback = [];
  onRejectedCallback = [];

  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("MyPromise resolver undefined is not a function");
    }

    const resolve = (value) => {
      queueMicrotask(() => {
        if (this.state !== "pending") return;
        this.state = "fulfilled";
        this.value = value;

        this.onFulfilledCallback.forEach((fn) => fn(value));
      });
    };

    const reject = (reason) => {
      queueMicrotask(() => {
        if (this.state !== "pending") return;
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallback.forEach((fn) => fn(reason));
      });
    };

    executor(resolve, reject);
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    const promise2 = new MyPromise((resolve, reject) => {
      const strategy = {
        fulfilled: () => {
          queueMicrotask(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        },
        rejected: () => {
          queueMicrotask(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        },
        pending: () => {
          this.onFulfilledCallback.push(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });

          this.onRejectedCallback.push(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        },
      };

      strategy[this.state]?.();
    });

    return promise2;
  }
}
