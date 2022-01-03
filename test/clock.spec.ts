import { Clock, Ordering } from "../src/clock";

it("test inc", () => {
  const a = new Clock("a", 0);
  expect(a.inc().toString()).toBe("0000000001:a");
  expect(a.toString()).toBe("0000000000:a");
});

it("test compare", () => {
  const a = new Clock("a", 0);
  const a1 = new Clock("a", 1);
  const b = new Clock("b", 0);
  const b2 = new Clock("b", 2);

  expect(a1.toString() === a.inc().toString()).toBeTruthy();
  expect(a1.compare(a.inc())).toEqual(Ordering.Equal);

  expect(a < b).toBeTruthy();
  expect(a.compare(b)).toEqual(Ordering.Less);

  expect(b.compare(a)).toEqual(Ordering.Greater);

  expect(a < a1).toBeTruthy();
  expect(a.compare(a1)).toEqual(Ordering.Less);

  expect(b < a1).toBeTruthy();
  expect(b.compare(a1)).toEqual(Ordering.Less);

  expect(b2 > a1).toBeTruthy();
  expect(b2.compare(a1)).toEqual(Ordering.Greater);
});

it("", () => {
  const a = new Clock("a", 0);
  expect(Clock.encode(a)).toEqual(["a", 0]);
});
