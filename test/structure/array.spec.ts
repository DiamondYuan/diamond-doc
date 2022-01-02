import { DiamondDoc, DiamondArray } from "../../src";

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
