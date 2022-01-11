import { TestDoc } from "../fixture/test-doc";
import path from "path";
import fs from "fs/promises";
import zlib from "zlib";
import assert from "assert";
import { EditStackService } from "../../src/undo";
import { isStructureOperation } from "../../src/utils/is-diamond-structure";

const run = async () => {
  const dataPath = path.join(__dirname, "data/automerge-paper.json.gz");
  const json = JSON.parse(
    zlib.gunzipSync(await fs.readFile(dataPath)).toString()
  ) as {
    startContent: string;
    endContent: string;
    txns: {
      time: string;
      /**
       * like [position, numDeleted, inserted content]
       */
      patches: Array<[number, number, number]>;
    }[];
  };
  let content = json.startContent;

  for (const { patches } of json.txns) {
    for (const [pos, delHere, insContent] of patches) {
      const before = content.slice(0, pos);
      const after = content.slice(pos + delHere);
      content = before + insContent + after;
    }
  }

  const doc = new TestDoc();
  const array = doc.getArray("benchmark");
  array.push("");
  console.time();
  const undo = doc.createOperationManager(EditStackService);
  undo.track(array);
  for (const { patches } of json.txns) {
    for (const [pos, delHere, insContent] of patches) {
      if (delHere) {
        array.remove(pos + delHere);
      } else {
        array.insert(pos, insContent);
      }
      if (Math.random() * 100 > 90) {
        undo.pushStackElement();
      }
    }
  }
  console.timeEnd();

  console.time("reload");
  const reload = new TestDoc(doc.operations);
  console.timeEnd("reload");

  console.time("getArray");
  const array2 = reload.getArray("benchmark");
  assert(array2.toJS().join("") === content, "equal");
  console.timeEnd("getArray");

  console.time("undo");
  undo.undo();
  console.timeEnd("undo");
  console.time("redo");
  undo.redo();
  console.timeEnd("redo");
  assert(json.endContent === content, "equal");
  assert(array.toJS().join("") === content, "equal");

  console.time("js-array-push");
  const arr = [];
  for (const op of reload.operations) {
    if (isStructureOperation(op)) {
      arr.push(op);
    } else {
      arr.push(op);
    }
  }
  console.timeEnd("js-array-push");
};

run();
