
/* global describe, test, expect */

const StatedPromise = require("../dist/4z-stated-promise.min.js");

const entries = ["resolved 0", "resolved 1"];

const expected = {
  state : "fulfilled",
  value : entries,
  reason: undefined,
};

const expectedAllSettled = {
  state: "fulfilled",
  value: entries.map(value => ({
    reason: undefined,
    status: "fulfilled",
    value,
  })),
};

describe("StatedPromise.allSettled() immediately resolved without await", () => {

  test("Without arguments", async () => {
    expect(StatedPromise.allSettled().toJSON()).toEqual({
      reason: undefined,
      state : "fulfilled",
      value : [],
    });
  });

  test("With direct values array", async () => {
    expect(StatedPromise.allSettled(entries).toJSON()).toEqual(expectedAllSettled);
  });

  test("With generator", () => {

    function* source() {
      for (const entry of entries)
        yield StatedPromise.resolve(entry);
    }

    expect(StatedPromise.allSettled(source()).toJSON()).toEqual(expectedAllSettled);
  });

  test("With generator on direct values", () => {

    function* source() {
      for (const entry of entries)
        yield entry;
    }

    expect(StatedPromise.allSettled(source()).toJSON()).toEqual(expectedAllSettled);
  });

  test("With array of async function and standard Promise", async () => {

    const remaining = [...entries];
    const timeout   = 100;

    const next = () => new Promise((resolve, reject) => {
      setTimeout(() => resolve(remaining.shift()), timeout);
    });

    const startedAt = Date.now();

    expect(await StatedPromise.allSettled([
      next,
      async () => await next(),
    ])).toEqual(expectedAllSettled.value);

    expect(
      Math.round((Date.now() - startedAt) / timeout),
    ).toEqual(entries.length);
  });
});
