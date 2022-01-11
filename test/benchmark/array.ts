import { TestDoc } from "../fixture/test-doc";

const index = 0;
const data: number[] = [];
for (let i = 0; i < 10000; i++) {
  const a1 = Math.floor(Math.random() * i);
  data.push(a1);
}

const doc = new TestDoc();

const array = doc.getArray("benchmark");
array.push("");
const start = Date.now();
data.forEach((e) => {
  array.insert(e, `${e}`);
});
const time = Date.now() - start;
console.log(time);
