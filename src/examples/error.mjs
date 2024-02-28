
import StatedPromise from "../index.mjs";

function dump(p) {
  if (p.toJSON)
    console.table([p.toJSON()]);
  else
    console.log(p);
}

let p;

for (const constructor of [
  Promise,
  StatedPromise,
]) {

  console.log(constructor);

  p = new constructor((resolve, reject) => {
    setTimeout(reject, 500, new Error("This is an error"));
  }).catch(error => {
    console.error({"catch-callback": error.toString()});
  });

  try {
    await p;
  } catch (error) {
    console.error({"catch-block": error.toString()});
  }

  p = constructor.all([
    new constructor(resolve => resolve(true)),
    new constructor(resolve => setTimeout(resolve, 500, true)),
    new constructor((resolve, reject) => {
      setTimeout(reject, 250, new Error("This is an error"));
    }),
  ]);

  dump(p);

  // await p; // throw error
  await p.catch(console.error);

  dump(p);
}
