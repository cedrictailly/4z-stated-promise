
// TODO: race() + any() : Error("This is an error") thrown at the end of the timeout for StatedPromise but not for Promise

function getIterator(value) {

  if (value[Symbol.iterator])
    return value[Symbol.iterator]();

  if (value.next)
    return value;

  throw new TypeError("Value is not iterable");
}

export default class StatedPromise {

  static resolve(value) { return new this(resolve => resolve(value)); }
  static reject(reason) { return new this((resolve, reject) => reject(reason)); }

  static coerce(value) {

    if (typeof value == "function") {
      try {
        value = value();
      } catch (error) {
        return StatedPromise.reject(error);
      }
    }

    if (value instanceof StatedPromise)
      return value;

    if (value instanceof Promise)
      return new StatedPromise((resolve, reject) => {value.then(resolve, reject);});

    return StatedPromise.resolve(value);
  }

  static allSettled(values) {

    if (!values)
      return StatedPromise.resolve([]);

    const iterator = getIterator(values);

    return new this((resolve, reject) => {

      const result = [];

      const next = (pred = null) => {

        switch (pred?.state) {
        case "fulfilled": result.push({status: "fulfilled", value: pred.value});   break;
        case "rejected":  result.push({status: "rejected",  reason: pred.reason}); break;
        }

        const {value, done} = iterator.next();

        if (done)
          return resolve(result);

        const p = this.coerce(value);

        if (p.state != "pending")
          return next(p);

        p.then(
          value  => { next(p); },
          reason => { next(p); },
        );
      };

      next();
    });
  }

  static all(values) {

    if (!values)
      return StatedPromise.resolve([]);

    return new this((resolve, reject) => {

      const result  = [];
      const pending = new Set();

      const check = () => {
        if (pending.size == 0)
          resolve(result);
      };

      for (const value of values) {

        const p = this.coerce(value);

        switch (p.state) {

        case "fulfilled":
          result.push(p.value);
          break;

        case "rejected":
          return reject(p.reason);

        default: {

          const index = result.length;

          result.push(-1);

          pending.add(
            p.then(
              value => {
                result[index] = value;
                pending.delete(p);
                check();
              },
              reject,
            ),
          );

        } break;
        }
      }

      check();
    });
  }

  static any(values) {

    if (!values)
      return StatedPromise.reject(new AggregateError([], "No promises to resolve"));

    return new this((resolve, reject) => {

      const errors  = [];
      const pending = new Set();

      const check = () => {
        if (pending.size == 0)
          reject(new AggregateError(errors, "All promises were rejected"));
      };

      for (const value of values) {

        const p = this.coerce(value);

        switch (p.state) {

        case "fulfilled":
          return resolve(p.value);

        case "rejected":
          errors.push(p.reason);
          break;

        default: {

          const index = errors.length;

          errors.push(undefined);

          pending.add(
            p.then(
              resolve,
              error => {
                errors[index] = error;
                pending.delete(p);
                check();
              },
            ),
          );
        } break;
        }
      }

      check();
    });
  }

  static race(values) {

    if (!values)
      return StatedPromise.reject(new AggregateError([], "No promises to resolve"));

    return new this((resolve, reject) => {

      for (const value of values) {

        const p = this.coerce(value).catch(() => {});

        switch (p.state) {

        case "fulfilled":
          return resolve(p.value);

        case "rejected":
          return reject(p.reason);

        default:
          p.then(resolve).catch(reject);
          break;
        }
      }
    });
  }

  static handle(callback) {

    const promise = new this(callback);

    switch (promise.state) {

    case "fulfilled":
      return promise.value;

    case "rejected":
      throw promise.reason;

    default:
      return promise.#promise;
    }
  }

  #state;
  #value;
  #reason;
  #promise;

  get state()   { return this.#state; }
  get value()   { return this.#value; }
  get reason()  { return this.#reason; }
  get promise() { return this.#promise; }

  constructor(callback) {

    if (typeof callback !== "function")
      throw new TypeError("StatedPromise constructor argument must be a function");

    this.#state = "pending";

    this.#promise = new Promise((resolve, reject) => {

      const resolved = value => {
        this.#state = "fulfilled";
        this.#value = value;
        resolve(value);
      };

      const rejected = reason => {
        this.#state  = "rejected";
        this.#reason = reason;
        reject(reason);
      };

      try {
        callback(resolved, rejected);
      } catch (error) {
        rejected(error);
      }
    });
  }

  then(resolved, rejected) {

    switch (this.state) {

    case "fulfilled":
      resolved(this.value);
      break;

    case "rejected":
      if (!rejected) throw this.reason;
      rejected(this.reason);
      break;

    default:
      this.#promise = this.#promise.then(resolved, rejected);
      break;
    }

    return this;
  }

  catch(callback) {

    switch (this.state) {

    case "fulfilled":
      break;

    case "rejected":
      callback(this.reason);
      break;

    default:
      this.#promise = this.#promise.catch(callback);
      break;
    }

    return this;
  }

  finally(callback) {
    this.#promise = this.#promise.finally(callback);
    return this;
  }

  toJSON() {
    return {
      state : this.#state,
      value : this.#value,
      reason: this.#reason?.toString(),
    };
  }
}
