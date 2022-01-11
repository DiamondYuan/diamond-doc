import {
  DiamondDoc,
  DiamondArray,
  IDiamondDocContext,
  DiamondMap,
  Operation,
} from "../src";
import { Clock, Ordering } from "../src/clock";
import { TestDoc } from "./fixture/test-doc";

class ThrowArray extends DiamondArray {
  constructor(structureName: string, context: IDiamondDocContext) {
    super(structureName, context);
    throw new Error("1");
  }
}

it("not throw", () => {
  const doc = new TestDoc();
  const arr = doc.getArray("test");
  for (let i = 0; i < 10000; i++) {
    arr.push(i);
  }
  new DiamondDoc(doc.operations, [DiamondMap, ThrowArray]);
});

it("operation sort", () => {
  const doc = new TestDoc();
  for (let i = 0; i < 10000; i++) {
    doc.getArray(`${i}`).push(`${i}`);
  }
  let pre: Operation | null = null;
  for (const op of doc.operations) {
    if (pre) {
      expect(Clock.decode(op.id).compare(Clock.decode(pre.id))).toEqual(
        Ordering.Greater
      );
    }
    pre = op;
  }
});
