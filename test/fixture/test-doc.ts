import { DiamondArray } from "./../../src/structure/DiamondArray";
import { Operation, DiamondDocOptions } from "./../../src/types";
import { DiamondDoc } from "./../../src/doc/DiamondDoc";
import { DiamondMap } from "../../src";

export class TestDoc extends DiamondDoc {
  constructor(operations?: Operation[], options?: DiamondDocOptions) {
    super(operations ?? [], [DiamondArray, DiamondMap], options);
  }
  getArray(name?: string) {
    return super.get(DiamondArray, name);
  }
  getMap(name?: string) {
    return super.get(DiamondMap, name);
  }
}
