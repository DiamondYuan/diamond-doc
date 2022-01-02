import {
  DiamondStructure,
  update,
  Operation,
  IDiamondDocContext,
} from "../types";

import { isDiamondStructure } from "../utils/is-diamond-structure";

export interface DMapSetOperation extends Operation {
  type: "set";
  key: string;
  value: DiamondMapValue;
}

export type DiamondMapOperation = DMapSetOperation;

export type DiamondMapValue =
  | { type: "string"; value: string }
  | {
      type: "diamond-structure";
      structureName: string;
      structureCtorId: string;
    };

export type DiamondMapValueType = string | DiamondStructure;

export class DiamondMap implements DiamondStructure {
  static structureCtorId: string = "DiamondMap";
  public readonly structureCtorId = "DiamondMap";
  private data: Map<string, DiamondMapValue>;
  constructor(
    public structureName: string,
    private context: IDiamondDocContext
  ) {
    this.data = new Map<string, DiamondMapValue>();
  }

  [update](operations: DiamondMapOperation[]) {
    const data = new Map<string, DiamondMapValue>();
    for (const op of operations) {
      data.set(op.key, op.value);
    }
    this.data = data;
    return this;
  }

  set(key: string, value: DiamondMapValueType) {
    const internalValue = this.valueOperationValue(value);
    const op: DMapSetOperation = {
      id: this.context.tick(),
      key: key,
      value: internalValue,
      type: "set",
      structureCtorId: DiamondMap.structureCtorId,
      structureName: this.structureName,
    };
    this.context.appendOperation(op);
    this.data.set(key, internalValue);
  }

  get(key: string): DiamondMapValueType | undefined {
    if (this.data.has(key)) {
      return this.internalValueToValue(this.data.get(key)!);
    }
  }

  private valueOperationValue(value: DiamondMapValueType): DiamondMapValue {
    if (isDiamondStructure(value)) {
      return {
        type: "diamond-structure",
        structureName: value.structureName,
        structureCtorId: value.structureCtorId,
      };
    }
    if (typeof value === "string") {
      return {
        type: "string",
        value: value,
      };
    }
    throw new Error("un support value");
  }

  private internalValueToValue(value: DiamondMapValue): DiamondMapValueType {
    switch (value.type) {
      case "string": {
        return value.value;
      }
      case "diamond-structure": {
        return this.context.get(value.structureCtorId, value.structureName);
      }
    }
  }

  toJS(): Map<string, DiamondMapValueType> {
    const js = new Map<string, DiamondMapValueType>();
    this.data.forEach((value, key) =>
      js.set(key, this.internalValueToValue(value))
    );
    return js;
  }
}
