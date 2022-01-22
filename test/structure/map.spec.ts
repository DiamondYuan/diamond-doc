import { DiamondDoc, DiamondMap } from "../../src";

function expectEquals(map: DiamondMap) {
  return {
    name: map.get("name"),
    job: map.get("job"),
  };
}
it("test map", () => {
  const remote = new DiamondDoc([], [DiamondMap], {
    actorId: "c1ba110c-f865-4a5e-a1a7-ae054aa6f0aa",
  });
  const remoteMap = remote.get(DiamondMap, "properties");

  const local = new DiamondDoc([], [DiamondMap], {
    actorId: "c1ba110c-f865-4a5e-a1a7-ae054aa6f0ab",
  });
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
  expect(v.structureName).toEqual(
    "0000000003:c1ba110c-f865-4a5e-a1a7-ae054aa6f0ab"
  );
});

it("value", () => {
  const local = new DiamondDoc([], [DiamondMap]);
  const localMap = local.get(DiamondMap, "properties");
  const testMap = local.get(DiamondMap, "test");
  testMap.set("test-key", "test-value");
  const testData = [null, 1, "2", 3.3, true, false];
  testData.forEach((value, index) => {
    localMap.set(`${index}`, value);
  });

  localMap.set("map", testMap);

  const remote = new DiamondDoc([], [DiamondMap]);
  remote.merge(local);
  const remoteMap = remote.get(DiamondMap, "properties");
  const remoteTestMap = remote.get(DiamondMap, "test");
  for (let i = 0; i < testData.length; i++) {
    expect(testData[i] === remoteMap.get(`${i}`)).toBeTruthy();
  }

  expect(remoteTestMap === remoteMap.toJS().get("map")).toBeTruthy();
  expect(remoteTestMap.get("test-key")).toEqual("test-value");
});

it("test delete and add", () => {
  const remote = new DiamondDoc([], [DiamondMap], {
    actorId: "c1ba110c-f865-4a5e-a1a7-ae054aa6f0aa",
  });
  const local = new DiamondDoc([], [DiamondMap], {
    actorId: "c1ba110c-f865-4a5e-a1a7-ae054aa6f0ab",
  });

  const map_local = local.get(DiamondMap, "map");
  map_local.set("key", "local");
  map_local.delete("key");

  const map_remote = remote.get(DiamondMap, "map");
  map_remote.set("key", "remote");

  expect(remote.version).toEqual({ "c1ba110c-f865-4a5e-a1a7-ae054aa6f0aa": 1 });

  local.merge(remote);
  remote.merge(local);

  expect(remote.version).toEqual({
    "c1ba110c-f865-4a5e-a1a7-ae054aa6f0aa": 1,
    "c1ba110c-f865-4a5e-a1a7-ae054aa6f0ab": 2,
  });

  expect(map_remote.get("key")).toEqual(undefined);
  expect(map_remote.get("key")).toEqual(undefined);
});

it("type", () => {
  const remote = new DiamondDoc([], [DiamondMap]);
  interface MusicSchema {
    play: number;
    title: string;
    createdAt: number;
    fun: Function;
  }
  const map_local = remote.get<DiamondMap<MusicSchema>>(
    DiamondMap,
    "music_props"
  );

  const created_at: number = map_local.get("createdAt")!;
  const not_in_schema = map_local.get<string>("not_in_schema");
  const fun = map_local.get<string>("fun");
});
