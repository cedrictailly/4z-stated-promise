
const StatedPromise = require("../../dist/4z-stated-promise.min.js");

(async () => {

  const promises = [];

  promises.push(new StatedPromise((resolve, reject) => {
    resolve(true);
  }));

  promises.push(new StatedPromise((resolve, reject) => {
    setTimeout(resolve, 500, true);
  }));

  console.table(promises.map(p => p.toJSON()));

  await Promise.all(promises.filter(p => p.state == "pending"));

  console.table(promises.map(p => p.toJSON()));

})();
