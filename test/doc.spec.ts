import {
  DiamondDoc,
  DiamondArray,
  IDiamondDocContext,
  DiamondMap,
} from "../src";
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
