import { DiamondDoc } from "../src/index";
import { DiamondArray } from "../src/structure/DiamondArray";

it("test map", () => {
  const remote = new DiamondDoc([], [DiamondArray]);
  const remoteArray = remote.get(DiamondArray, "todo");

  const local = new DiamondDoc([], [DiamondArray]);
  const localArray = local.get(DiamondArray, "todo");

  localArray.push("local");

  remoteArray.push("remote");

  local.merge(remote);
  remote.merge(local);

  expect(localArray.toJS()).toEqual(remoteArray.toJS());

  const n = 60000;
  console.time(`insert ${n}`);
  for (let i = 0; i < 60000; i++) {
    const index = Math.floor(Math.random() * i);
    localArray.insert(index, `${i}`);
  }
  console.timeEnd(`insert ${n}`);
  console.time(`merge ${n}`);
  remote.merge(local);
  console.timeEnd(`merge ${n}`);

  expect(local.operations).toEqual(remote.operations);
  expect(localArray.toJS()).toEqual(remoteArray.toJS());
  expect(localArray.toJS().length).toEqual(remoteArray.toJS().length);
});
