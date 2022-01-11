import { TestDoc } from "./fixture/test-doc";

import { EditStackService } from "../src/undo";

it("test map", () => {
  const doc = new TestDoc([], "a");
  const undoManager = doc.createOperationManager(EditStackService);
  const map = doc.getMap();
  undoManager.track(map);
  map.set("a", "0");
  expect(undoManager.canUndo()).toBe(true);
  undoManager.undo();
  expect(doc.version).toEqual({ a: 3 });
  expect(map.get("a")).toBe(undefined);
  undoManager.redo();
  expect(doc.version).toEqual({ a: 4 });
  expect(map.get("a")).toBe("0");
});

it("test array", () => {
  const doc = new TestDoc();
  const remote = new TestDoc();
  const undoManager = doc.createOperationManager(EditStackService);
  const array = doc.getArray("arr");
  undoManager.track(array);
  array.push("1");
  remote.merge(doc);
  remote.getArray("arr").push("2");
  remote.getArray("arr").remove(0);
  doc.merge(remote);
  array.push("3");
  undoManager.pushStackElement();
  array.push("4");
  expect(array.toJS().join("")).toBe("234");
  undoManager.undo();
  expect(array.toJS().join("")).toBe("23");
  undoManager.undo();
  expect(array.toJS().join("")).toBe("2");
  undoManager.redo();
  expect(array.toJS().join("")).toBe("23");
  undoManager.redo();
  expect(array.toJS().join("")).toBe("234");
});

it("test canRedo and canUndo", () => {
  const doc = new TestDoc();
  const undoManager = doc.createOperationManager(EditStackService);
  const array = doc.getArray("arr");
  array.push("0");
  undoManager.track(array);
  array.push("1");
  array.remove(0);
  undoManager.undo();
  expect(array.toJS().join("")).toBe("0");
  expect(undoManager.canRedo()).toBeTruthy();
  expect(undoManager.canUndo()).toBeFalsy();
  var version = doc.version;
  undoManager.undo();
  expect(doc.version).toEqual(version);
  array.push("2");
  expect(undoManager.canUndo()).toBeTruthy();
  expect(undoManager.canRedo()).toBeFalsy();
  var version = doc.version;
  undoManager.canRedo();
  expect(doc.version).toEqual(version);
  const newDoc = new TestDoc(doc.operations);
  expect(newDoc.version).toEqual(doc.version);
  expect(newDoc.getArray("arr").toJS()).toEqual(array.toJS());
});
