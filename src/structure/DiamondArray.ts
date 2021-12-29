import { Clock } from "./../clock";
import {
  DiamondStructure,
  update,
  Operation,
  IDiamondDocContext,
} from "./../types";

interface DiamondArrayAddRight extends Operation {
  type: "addRight";
  left: Clock | null;
  value: string;
}

export type DiamondArrayOperation = DiamondArrayAddRight;

export class DiamondArray implements DiamondStructure {
  static structureCtorId: string = "DiamondArray";
  private data: { id: Clock; value: string }[] = [];
  constructor(
    public structureName: string,
    private context: IDiamondDocContext
  ) {}

  [update](operations: DiamondArrayOperation[]) {
    return this;
  }

  push(value: string): void {
    this.makeAddRightOperation(this.data.length - 1, value);
  }

  insert(leftIndex: number, value: string): void {
    this.makeAddRightOperation(leftIndex, value);
  }
  unshift(value: string): void {
    this.makeAddRightOperation(null, value);
  }

  private makeAddRightOperation(index: null | number, value: string): void {
    let left: Clock | null = null;
    if (index !== null) {
      left = this.data[index].id;
    }
    const id = this.context.tick();
    const op: DiamondArrayAddRight = {
      id,
      structureCtorId: DiamondArray.structureCtorId,
      structureName: this.structureName,
      type: "addRight",
      value: value,
      left,
    };
    this.context.appendOperation(op);
    const data = {
      id,
      value,
    };
    if (index === null) {
      this.data.unshift(data);
    } else {
      this.data.splice(index, 0, data);
    }
  }
}
