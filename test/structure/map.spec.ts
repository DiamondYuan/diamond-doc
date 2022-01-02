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
