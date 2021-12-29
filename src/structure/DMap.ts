import {
  DiamondStructure,
  update,
  Operation,
  IDiamondDocContext,
} from "./../types";

interface DMapSetOperation extends Operation {
  type: "set";
  key: string;
  value: string;
}

class DMap implements DiamondStructure {
  static structureCtorId: string = "DMap";
  private data: Map<string, string>;
  constructor(
    public structureName: string,
    private context: IDiamondDocContext
  ) {
    this.data = new Map<string, string>();
  }

  [update](operations: DMapSetOperation[]) {
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
      structureCtorId: DMap.structureCtorId,
      structureName: this.structureName,
    };
    this.context.appendOperation(op);
    this.data.set(key, value);
  }

  get(key: string): string | undefined {
    return this.data.get(key);
  }
}

export { DMap };
