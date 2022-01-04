import { EditStack } from "./../../src/undo";
import { DiamondArray } from "./../../src/structure/DiamondArray";
import { Operation } from "./../../src/types";
import { DiamondDoc } from "./../../src/doc/DiamondDoc";
import { DiamondMap } from "../../src";

export class TestDoc extends DiamondDoc {
  constructor(operations?: Operation[]) {
    super(operations ?? [], [DiamondArray, DiamondMap]);
  }
  getArray(name?: string) {
    return super.get(DiamondArray, name);
  }
  getMap(name?: string) {
    return super.get(DiamondMap, name);
  }
}
