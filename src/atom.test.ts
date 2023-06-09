import { map } from "rxjs/operators";
import { atom, readonlyAtom } from "./atom";
import { get } from "./get";
import { expect, describe, vi } from 'vitest'

describe("atom", () => {
  it("updates subscribers with its value", () => {
    const counter$ = atom(4);
    const cb1 = vi.fn(),
      cb2 = vi.fn();
    const sub1 = counter$.subscribe(cb1);
    const sub2 = counter$.subscribe(cb2);
    counter$.set(7);
    expect(cb1).toHaveBeenCalledWith(7);
    expect(cb2).toHaveBeenCalledWith(7);
    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it("calls a subscription synchronously with its current value", () => {
    const counter$ = atom(4);
    const cb = vi.fn();
    const sub = counter$.subscribe(cb);
    expect(cb).toHaveBeenCalledWith(4);
    sub.unsubscribe();
  });

  it("only updates subscribers when actually changed (using ===)", () => {
    const counter$ = atom(4);
    const cb = vi.fn();
    const sub = counter$.subscribe(cb);
    cb.mockReset();
    counter$.set(4);
    expect(cb).not.toHaveBeenCalled();
    sub.unsubscribe();
  });

  describe("map", () => {
    it("allows mapping the value to another atom", () => {
      const counter$ = atom(3);
      const square$ = counter$.map((i) => i * i);
      expect(square$.get()).toEqual(9);
    });

    it("the mapped value uses distinctUntilChanged", () => {
      const store$ = atom({ users: ["Tracy", "Popo", "Luggy"], index: 0 });
      const users$ = store$.map(({ users }) => users);

      const sub = vi.fn();
      users$.subscribe(sub);
      sub.mockClear();

      store$.update((s) => ({ ...s, users: s.users }));
      expect(sub).not.toHaveBeenCalled();

      store$.update((s) => ({ ...s, users: [] }));
      expect(sub).toHaveBeenCalled();
    });
  });

  describe("pipe", () => {
    it("allows piping", () => {
      const counter$ = atom(7);
      const square$ = counter$.pipe(
        map((i) => i * i),
        map((i) => i + 1)
      );
      expect(get(square$)).toEqual(50);
    });
  });

  describe("readonly", () => {
    it("returns a readonly version", () => {
      const counter$ = atom(4),
        readonlyCounter$ = counter$.readonly();

      expect("set" in readonlyCounter$).toBeFalsy();
      counter$.set(7);
      expect(readonlyCounter$.get()).toEqual(7);

      const cb = vi.fn(),
        sub = readonlyCounter$.subscribe(cb);
      expect(cb).toHaveBeenCalledWith(7);
      sub.unsubscribe();
    });

    it("creates a readonly version with readonlyAtom", () => {
      const [count$, setCount] = readonlyAtom(4);
      expect("set" in count$).toBeFalsy();
      setCount(7);
      expect(count$.get()).toEqual(7);
    });
  });
});