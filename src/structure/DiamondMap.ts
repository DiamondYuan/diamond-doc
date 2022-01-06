import {
  ValueDescription,
  DiamondDocValueType,
  DiamondStructure,
  IDiamondDocContext,
  StructureOperation,
} from "../types";
import { UPDATE } from "../constants";

export interface DiamondMap_Set extends StructureOperation {
  type: "set";
  key: string;
  value: ValueDescription;
}

export interface DiamondMap_Del extends StructureOperation {
  type: "delete";
  key: string;
}

export type DiamondMapOperation = DiamondMap_Set | DiamondMap_Del;
export class DiamondMap implements DiamondStructure {
  static structureCtorId: string = "DiamondMap";
  public readonly structureCtorId = "DiamondMap";
  private data: Map<string, ValueDescription>;
  constructor(
    public structureName: string,
    private context: IDiamondDocContext
  ) {
    this.data = new Map<string, ValueDescription>();
  }

  [UPDATE](operations: DiamondMapOperation[]) {
    const data = new Map<string, ValueDescription>();
    for (const op of operations) {
      switch (op.type) {
        case "set": {
          console.log(op)
          if (!op.delete) {
            data.set(op.key, op.value);
          }
          break;
        }
        case "delete": {
          if (!op.delete) {
            data.delete(op.key);
          }
          break
        }
      }
    }
    this.data = data;
    return this;
  }

  set(key: string, value: DiamondDocValueType) {
    const internalValue = this.context.getValueDescription(value);
    const op: DiamondMap_Set = {
      id: this.context.tick().encode(),
      key: key,
      value: internalValue,
      type: "set",
      structureCtorId: this.structureCtorId,
      structureName: this.structureName
    };
    this.context.appendOperation(op);
    this.data.set(key, internalValue);
  }

  delete(key: string) {
    const op: DiamondMap_Del = {
      id: this.context.tick().encode(),
      type: "delete",
      key: key,
      structureCtorId: this.structureCtorId,
      structureName: this.structureName
    };
    this.context.appendOperation(op);
    this.data.delete(key);
  }

  get(key: string): DiamondDocValueType | undefined {
    if (this.data.has(key)) {
      return this.context.getRawValue(this.data.get(key)!);
    }
  }

  toJS(): Map<string, DiamondDocValueType> {
    const js = new Map<string, DiamondDocValueType>();
    this.data.forEach((value, key) =>
      js.set(key, this.context.getRawValue(value))
    );
    return js;
  }
}
