import { TestDoc } from "./fixture/test-doc";

import { EditStackService } from '../src/undo'

it("test map", () => {
  const doc = new TestDoc();
  const undoManager = doc.createOperationManager(EditStackService);
  const map = doc.getMap();
  undoManager.track(map);
  map.set("a", "0");
  expect(undoManager.canUndo()).toBe(true);
  undoManager.undo();
  expect(map.get("a")).toBe(undefined);
  undoManager.redo();
  expect(map.get("a")).toBe("0");
});

it("test array", () => {
  const doc = new TestDoc();
  const remote = new TestDoc();
  const undoManager = doc.createOperationManager(EditStackService);
  const array = doc.getArray('arr');
  undoManager.track(array);
  array.push('1')
  remote.merge(doc)
  remote.getArray('arr').push('2')
  remote.getArray('arr').remove(0)
  doc.merge(remote)
  array.push('3')
  undoManager.pushStackElement()
  array.push('4')
  expect(array.toJS().join('')).toBe('234')
  undoManager.undo();
  expect(array.toJS().join('')).toBe('23')
  undoManager.undo();
  expect(array.toJS().join('')).toBe('2')
  undoManager.redo();
  expect(array.toJS().join('')).toBe('23')
  undoManager.redo();
  expect(array.toJS().join('')).toBe('234')
});


it('array', () => {
  const doc = new TestDoc();
  const undoManager = doc.createOperationManager(EditStackService);
  const array = doc.getArray('arr');
  array.push('0');
  undoManager.track(array)
  array.push('1');
  array.remove(0)
  undoManager.undo();
  expect(array.toJS().join('')).toBe('0')
  expect(undoManager.canRedo()).toBeTruthy()
  expect(undoManager.canUndo()).toBeFalsy()
  array.push('2')
  expect(undoManager.canUndo()).toBeTruthy()
  expect(undoManager.canRedo()).toBeFalsy()
})