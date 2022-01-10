import { DiamondArray } from "./../../src/structure/DiamondArray";
import { Operation } from "./../../src/types";
import { DiamondDoc } from "./../../src/doc/DiamondDoc";
import { DiamondMap } from "../../src";

export class TestDoc extends DiamondDoc {
  constructor(operations?: Operation[], name?: string) {
    super(operations ?? [], [DiamondArray, DiamondMap], { actorId: name });
  }
  getArray(name?: string) {
    return super.get(DiamondArray, name);
  }
  getMap(name?: string) {
    return super.get(DiamondMap, name);
  }
}
