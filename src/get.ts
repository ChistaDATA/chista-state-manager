import { Subscribable } from "./types";

type Gettable<T> = { getValue: () => T } | { get: () => T } | Subscribable<T>;

export function get<T>(obj: Gettable<T>): T {
  if ("getValue" in obj) {
    return obj.getValue();
  } else if ("get" in obj) {
    return obj.get();
  } else {
    let value: T;
    let callbackCalled = false;
    const subscription = obj.subscribe((v: T) => {
      value = v;
      callbackCalled = true;
    });
    subscription.unsubscribe();
    if (!callbackCalled) {
      throw new Error(
        "Cannot get value from a stream that doesn't call its subscriber synchronously"
      );
    }
    return value!;
  }
}