import { TestDoc } from "./fixture/test-doc";

import { UndoRedoService } from "../src/undo";

it("test map", () => {
  const doc = new TestDoc([], {
    actorId: "c1ba110c-f865-4a5e-a1a7-ae054aa6f0ab",
  });
  const undoManager = doc.createUndoRedoService(UndoRedoService);
  const map = doc.getMap();
  undoManager.track(map);
  map.set("a", "0");
  expect(undoManager.canUndo()).toBe(true);
  undoManager.undo();
  expect(doc.version).toEqual({ "c1ba110c-f865-4a5e-a1a7-ae054aa6f0ab": 3 });
  expect(map.get("a")).toBe(undefined);
  undoManager.redo();
  expect(doc.version).toEqual({ "c1ba110c-f865-4a5e-a1a7-ae054aa6f0ab": 4 });
  expect(map.get("a")).toBe("0");
});

it("test array", () => {
  const doc = new TestDoc();
  const remote = new TestDoc();
  const undoManager = doc.createUndoRedoService(UndoRedoService);
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

  const newDoc = new TestDoc(doc.operations);
  expect(newDoc.version).toEqual(doc.version);
  expect(newDoc.getArray("arr").toJS()).toEqual(array.toJS());
});

it("test canRedo and canUndo", () => {
  const doc = new TestDoc();
  const undoManager = doc.createUndoRedoService(UndoRedoService);
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
  undoManager.redo();
  expect(doc.version).toEqual(version);
  const newDoc = new TestDoc(doc.operations);
  expect(newDoc.version).toEqual(doc.version);
  expect(newDoc.getArray("arr").toJS()).toEqual(array.toJS());
});

it("test array", () => {
  const doc = new TestDoc();
  const undoManager = doc.createUndoRedoService(UndoRedoService);
  const array = doc.getArray("arr");
  undoManager.track(array);
  const cache: number[][] = [[]];
  for (let i = 0; i < 10; i++) {
    array.push(i);
    undoManager.pushStackElement();
    cache.push([...(array.toJS() as number[])]);
  }

  for (let i = 0; i < 10; i++) {
    undoManager.undo();
    expect(array.toJS()).toEqual(cache[9 - i]);
  }
});
