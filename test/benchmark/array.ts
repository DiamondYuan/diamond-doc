import { TestDoc } from "../fixture/test-doc";
import path from "path";
import fs from "fs/promises";
import zlib from "zlib";
import assert from "assert";

// const data: number[] = [];
// for (let i = 0; i < 100000; i++) {
//   const a1 = Math.floor(Math.random() * i);
//   data.push(a1);
// }

// array.push("");
// const start = Date.now();
// data.forEach((e) => {
//   array.insert(e, `${e}`);
// });
// const time = Date.now() - start;
// console.log(time);

// console.log(array.toJS());

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
  const doc = new TestDoc();
  const array = doc.getArray("benchmark");
  array.push("");
  console.time();
  for (const { patches } of json.txns) {
    for (const [pos, delHere, insContent] of patches) {
      const before = content.slice(0, pos);
      const after = content.slice(pos + delHere);
      content = before + insContent + after;
      if (delHere) {
        array.remove(pos + delHere);
      } else {
        array.insert(pos, insContent);
      }
    }
  }
  console.timeEnd();
  console.log(array.toJS().join("").length, content.length);
  assert(json.endContent === content, "equal");
  assert(array.toJS().join("") === content, "equal");
};

run();
