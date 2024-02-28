
import StatedPromise from "../index.mjs";

function dump(p) {
  if (p.toJSON)
    console.table([p.toJSON()]);
  else
    console.log(p);
}

for (const constructor of [
  Promise,
  StatedPromise,
]) {

  console.log(constructor);

  const p = constructor.allSettled([
    "no wait",
    new constructor(resolve => resolve(true)),
    new constructor(resolve => setTimeout(resolve, 100, true)),
    new constructor((resolve, reject) => setTimeout(reject, 100, new Error("This is an error"))),
  ]);

  dump(p);

  const result = await p.catch(console.error);

  dump(p);

  console.log({result});
}
