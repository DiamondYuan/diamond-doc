import { DiamondArray } from "./../../src/structure/DiamondArray";
import {
  Operation,
  DiamondDocOptions,
  DiamondDocValueType,
} from "./../../src/types";
import { DiamondDoc } from "./../../src/doc/DiamondDoc";
import { DiamondMap } from "../../src";

export class TestDoc extends DiamondDoc {
  constructor(operations?: Operation[], options?: DiamondDocOptions) {
    super(operations ?? [], [DiamondArray, DiamondMap], options);
  }
  getArray<T extends DiamondDocValueType = DiamondDocValueType>(name?: string) {
    return super.get<DiamondArray<T>>(DiamondArray, name);
  }
  getMap(name?: string) {
    return super.get(DiamondMap, name);
  }
}
