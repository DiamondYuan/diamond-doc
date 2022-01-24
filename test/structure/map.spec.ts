import { assert, IsExact } from "./../type-test";
import { DiamondDoc, DiamondDocValueType, DiamondMap } from "../../src";

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

  expect(remoteTestMap === remoteMap.toJS()["map"]).toBeTruthy();
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

describe("test type", () => {
  const remote = new DiamondDoc([], [DiamondMap]);
  interface TestSchema {
    number_key: number;
    number_or_string_key: number | string;
    function_key: Function;
  }
  const map_local = remote.get<DiamondMap<TestSchema>>(
    DiamondMap,
    "music_props"
  );

  function createMap<
    Schema = unknown,
    RestType extends DiamondDocValueType = DiamondDocValueType
  >() {
    const doc = new DiamondDoc([], [DiamondMap]);
    return doc.get<DiamondMap<Schema, RestType>>(DiamondMap, "map_for test");
  }

  describe("test map.set", () => {
    describe("if schema[key] extends DiamondDocValueType", () => {
      it("give correct type", () => {
        createMap<TestSchema>().set("number_key", Date.now());
        createMap<TestSchema>().set("number_or_string_key", Date.now());
        createMap<TestSchema>().set("number_or_string_key", "2021-09-30");
      });
      it("give wrong value should throw", () => {
        //@ts-expect-error
        createMap<TestSchema>().set("number_key", "now");
        //@ts-expect-error
        createMap<TestSchema>().set("number_key", true);
        //@ts-expect-error
        createMap<TestSchema>().set("number_or_string_key", true);
      });
    });
    describe("if schema[key] not extends DiamondDocValueType", () => {
      describe("key not exists in keyof schema", () => {
        it("will ignore value type", () => {
          createMap<TestSchema>().set("not_in_schema", "now");
          createMap<TestSchema>().set("not_in_schema", true);
          createMap<TestSchema>().set("not_in_schema", 1);
        });
      });
      describe("if value type is Function", () => {
        createMap<TestSchema>().set("function_key", "now");
        createMap<TestSchema>().set("function_key", true);
        createMap<TestSchema>().set("function_key", 1);
      });
    });
  });
});
