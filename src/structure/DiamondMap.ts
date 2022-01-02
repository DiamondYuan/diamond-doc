import {
  ValueDescription,
  DiamondDocValueType,
  DiamondStructure,
  update,
  Operation,
  IDiamondDocContext,
} from "../types";

export interface DMapSetOperation extends Operation {
  type: "set";
  key: string;
  value: ValueDescription;
}

export type DiamondMapOperation = DMapSetOperation;

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

  [update](operations: DiamondMapOperation[]) {
    const data = new Map<string, ValueDescription>();
    for (const op of operations) {
      data.set(op.key, op.value);
    }
    this.data = data;
    return this;
  }

  set(key: string, value: DiamondDocValueType) {
    const internalValue = this.context.getValueDescription(value);
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
