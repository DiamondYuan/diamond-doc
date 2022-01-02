import { DiamondDoc, DiamondMap } from "../../src";

function expectEquals(map: DiamondMap) {
  return {
    name: map.get("name"),
    job: map.get("job"),
  };
}
it("test map", () => {
  const remote = new DiamondDoc([], [DiamondMap]);
  const remoteMap = remote.get(DiamondMap, "properties");

  const local = new DiamondDoc([], [DiamondMap]);
  const localMap = local.get(DiamondMap, "properties");

  localMap.set("name", "Alice");
  remoteMap.set("name", "Bob");
  remoteMap.set("job", "CRUD");

  local.merge(remote);
  remote.merge(local);

  const localReload = new DiamondDoc(local.operations, [DiamondMap]);
  const localReloadMap = localReload.get(DiamondMap, "properties");

  expect(localMap).toBe(local.get(DiamondMap, "properties"));
  expect(expectEquals(localMap)).toEqual(expectEquals(remoteMap));
  expect(expectEquals(localMap)).toEqual(expectEquals(localReloadMap));

  expect(local.operations).toEqual(remote.operations);
  expect(local.version).toEqual(remote.version);

  const v = local.get(DiamondMap);
  expect(v.structureName.startsWith("0000000003")).toBeTruthy();
});

it("value", () => {
  const local = new DiamondDoc([], [DiamondMap]);
  const localMap = local.get(DiamondMap, "properties");
  const testMap = local.get(DiamondMap, "test");
  testMap.set("test-key", "test-value");
  const testData = [null, 1, "2", 3.3, true, false, testMap];
  testData.forEach((value, index) => {
    localMap.set(`${index}`, value);
  });

  const remote = new DiamondDoc([], [DiamondMap]);
  remote.merge(local);
  const remoteMap = remote.get(DiamondMap, "properties");
  const remoteTestMap = remote.get(DiamondMap, "test");
  const expectData = testData.slice(0, -1).concat(remoteTestMap);
  for (let i = 0; i < testData.length; i++) {
    expect(expectData[i] === remoteMap.get(`${i}`)).toBeTruthy();
  }
  expect(remoteTestMap.get("test-key")).toEqual("test-value");
});
