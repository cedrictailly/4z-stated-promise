
export default class StatedPromise<T> extends Promise<T> {
  state: "pending" | "fulfilled" | "rejected";
  result: T;
  error: any;
  promise: Promise<T>;
}
