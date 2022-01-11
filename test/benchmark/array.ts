import { TestDoc } from "../fixture/test-doc";
import path from "path";
import fs from "fs/promises";
import zlib from "zlib";
import assert from "assert";

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
  for (const { patches } of json.txns) {
    for (const [pos, delHere, insContent] of patches) {
      if (delHere) {
        array.remove(pos + delHere);
      } else {
        array.insert(pos, insContent);
      }
    }
  }
  console.timeEnd();
  assert(json.endContent === content, "equal");
  assert(array.toJS().join("") === content, "equal");
};

run();
