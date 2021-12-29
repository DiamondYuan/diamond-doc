import { DiamondDoc } from "../src/index";
import { DMap } from "../src/structure/DMap";

function expectEquals(map: DMap) {
  return {
    name: map.get("name"),
    job: map.get("job"),
  };
}
it("test map", () => {
  const remote = new DiamondDoc([], [DMap]);
  const remoteMap = remote.get(DMap, "properties");

  const local = new DiamondDoc([], [DMap]);
  const localMap = local.get(DMap, "properties");

  localMap.set("name", "Alice");
  remoteMap.set("name", "Bob");
  remoteMap.set("job", "CRUD");

  local.merge(remote);
  remote.merge(local);

  const localReload = new DiamondDoc(local.operations, [DMap]);
  const localReloadMap = localReload.get(DMap, "properties");

  expect(localMap).toBe(local.get(DMap, "properties"));
  expect(expectEquals(localMap)).toEqual(expectEquals(remoteMap));
  expect(expectEquals(localMap)).toEqual(expectEquals(localReloadMap));

  expect(local.operations).toEqual(remote.operations);
  expect(local.version).toEqual(remote.version);
});
