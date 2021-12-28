import { DiamondDoc } from "../src/index";
import { DMap } from "../src/structure/DMap";

const remote = new DiamondDoc([]);
const remoteMap = remote.get(DMap, "properties");

const local = new DiamondDoc([]);

const localMap = local.get(DMap, "properties");

localMap.set("name", "Alice");
remoteMap.set("name", "Bob");
remoteMap.set("job", "CRUD");

local.merge(remote);
remote.merge(local);

console.log(localMap.get("name") === remoteMap.get("name"));
console.log(localMap.get("job") === remoteMap.get("job"));
