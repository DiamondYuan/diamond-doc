import { TestDoc } from "./../fixture/test-doc";
import { DiamondDoc, DiamondArray, DiamondMap } from "../../src";
import { getOperationsByVersion } from "../../src/utils/get-operations-by-version";

it("test DiamondArray", () => {
  const remote = new DiamondDoc([], [DiamondArray]);
  const remoteArray = remote.get(DiamondArray, "todo");

  const local = new DiamondDoc([], [DiamondArray]);
  const localArray = local.get(DiamondArray, "todo");

  localArray.push("local");

  remoteArray.push("remote");

  local.merge(remote);
  remote.merge(local);

  expect(local.version).toEqual(remote.version);

  expect(localArray.toJS()).toEqual(remoteArray.toJS());

  localArray.remove(0);
  remoteArray.insert(0, "local-new");

  local.merge(remote);
  remote.merge(local);
  expect(localArray.toJS()).toEqual(remoteArray.toJS());

  const n = 6000;
  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * i);
    localArray.insert(index, `${i}`);
  }
  remote.merge(local);
  expect(local.operations).toEqual(remote.operations);
  expect(localArray.toJS()).toEqual(remoteArray.toJS());
  expect(localArray.toJS().length).toEqual(remoteArray.toJS().length);
});

it("map and array", () => {
  const remote = new DiamondDoc([], [DiamondArray, DiamondMap]);
  const remoteArray = remote.get(DiamondArray, "todo");

  const local = new DiamondDoc([], [DiamondArray, DiamondMap]);
  const localArray = local.get(DiamondArray, "todo");

  const task1 = local.get(DiamondMap);
  task1.set("task", "task 01");
  localArray.push(task1);

  remote.merge(local);

  const remoteTaskOne: DiamondMap = remoteArray.toJS()[0] as DiamondMap;
  expect(remoteTaskOne.get("task")).toEqual("task 01");
});

it("support stringify and parse", () => {
  const local = new TestDoc([]);
  const testMap = local.get(DiamondArray, "list");
  testMap.unshift("00");
  testMap.push("01");
  testMap.push("02");

  const snapshot = local.version;

  const newLocal = new TestDoc(JSON.parse(JSON.stringify(local.operations)));
  newLocal.getArray("list").push("03");
  local.merge(newLocal);
  expect(local.get(DiamondArray, "list").toJS()).toEqual([
    "00",
    "01",
    "02",
    "03",
  ]);

  expect(
    new TestDoc(getOperationsByVersion(local, snapshot)).getArray("list").toJS()
  ).toEqual(["00", "01", "02"]);
});
