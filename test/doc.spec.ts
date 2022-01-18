import {
  DiamondDoc,
  DiamondArray,
  IDiamondDocContext,
  DiamondMap,
  Operation,
} from "../src";
import { Clock, Ordering } from "../src/clock";
import { UndoRedoService } from "../src/undo";
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

it("set option.time true, every operation has time", () => {
  const startTime = Date.now();
  const doc = new TestDoc([], { time: true });
  const undoManager = doc.createUndoRedoService(UndoRedoService);
  const arr = doc.getArray("test");
  undoManager.track(arr);
  arr.push("1");
  undoManager.pushStackElement();
  arr.remove(0);
  const map = doc.getMap("test");
  undoManager.track(map);
  map.set("key", "1");
  undoManager.pushStackElement();
  map.delete("key");
  undoManager.undo();
  expect(map.get("key")).toEqual("1");
  undoManager.undo();
  expect(arr.toJS()).toEqual(["1"]);
  undoManager.redo();
  expect(arr.toJS()).toEqual([]);
  undoManager.redo();
  expect(map.get("key")).toBeUndefined();
  doc.operations.forEach((e) => {
    expect(e.time! >= startTime).toBeTruthy();
    expect(e.time).not.toBeUndefined();
  });
});

it("actorId is not uuid, expect throw", () => {
  try {
    new TestDoc([], { time: true, actorId: "a" });
  } catch (error) {
    expect((error as Error).message).toEqual("actorId should be uuid");
  }
});
