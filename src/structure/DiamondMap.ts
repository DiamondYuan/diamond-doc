import {
  DiamondStructure,
  update,
  Operation,
  IDiamondDocContext,
} from "../types";

interface DMapSetOperation extends Operation {
  type: "set";
  key: string;
  value: string;
}

export type DiamondMapOperation = DMapSetOperation;
export class DiamondMap implements DiamondStructure {
  static structureCtorId: string = "DiamondMap";
  public readonly structureCtorId = "DiamondMap";
  private data: Map<string, string>;
  constructor(
    public structureName: string,
    private context: IDiamondDocContext
  ) {
    this.data = new Map<string, string>();
  }

  [update](operations: DiamondMapOperation[]) {
    const data = new Map<string, string>();
    for (const op of operations) {
      data.set(op.key, op.value);
    }
    this.data = data;
    return this;
  }

  set(key: string, value: string) {
    const op: DMapSetOperation = {
      id: this.context.tick(),
      key: key,
      value: value,
      type: "set",
      structureCtorId: DiamondMap.structureCtorId,
      structureName: this.structureName,
    };
    this.context.appendOperation(op);
    this.data.set(key, value);
  }

  get(key: string): string | undefined {
    return this.data.get(key);
  }

  toJS(): Map<string, string> {
    const js = new Map<string, string>();
    this.data.forEach((key, value) => js.set(key, value));
    return js;
  }
}
