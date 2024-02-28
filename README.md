
# 4z-stated-promise

`StatedPromise` is a JavaScript class that wraps and mimic standard promises with the ability to get their state, result and error synchronously using additional properties.

## Installation

Using yarn :

```bash
yarn add 4z-stated-promise
```

Using npm :

```bash
npm install 4z-stated-promise
```

## Usage

The `StatedPromise` class is used similarly to the original `Promise` class, you simply need to add `Stated` as a prefix when using it :

```javascript
import StatedPromise from "4z-stated-promise";

const p1 = new StatedPromise((resolve, reject) => {
  resolve(true);
});

const p2 = new StatedPromise((resolve, reject) => {
  setTimeout(resolve, 500, true);
});
```

The `StatedPromise` class can also be used with CommonJS :

```javascript
const StatedPromise = require("4z-stated-promise");

(...)
```

You can access the state, result, and reason of the rejection using the properties :

```javascript
console.log(p1.state);
console.log(p1.result);
console.log(p1.reason)
```

...or export as JSON :

```javascript
console.log(p1.toJSON());
```

## Static calls

Promise static functions are also usable :

```javascript
StatedPromise.all([
  new Promise(resolve => resolve(true))
  new Promise(resolve => setTimeout(resolve, 500, true))
]);
```

## Compatibility

It is compatible with the following module formats:

- ESM (ECMAScript Module)
- CommonJS
- AMD (Asynchronous Module Definition)
- UMD (Universal Module Definition)
- TypeScript (`/src/index.d.ts`)

The UMD version with sourcemaps for web browser is available at `/dist/4z-stated-promise.min.js`.

## Examples

You can find usage examples in the `/src/examples` directory.

## License

This project is licensed under the MIT License.
