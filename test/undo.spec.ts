import { TestDoc } from "./fixture/test-doc";

it("", () => {
  const doc = new TestDoc();
  const undoManager = doc.createOperationManager("a");
  const map = doc.getMap();
  undoManager.track(map);
  map.set("a", "0");
  expect(undoManager.canUndo()).toBe(true);
  undoManager.undo();
  expect(map.get("a")).toBe(undefined);
  undoManager.redo();
  expect(map.get("a")).toBe("0");
});
