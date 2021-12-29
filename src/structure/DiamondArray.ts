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

interface DiamondArrayRemove extends Operation {
  type: "remove";
  removeId: Clock;
}

export type DiamondArrayOperation = DiamondArrayAddRight | DiamondArrayRemove;

interface LinkNode {
  left: Clock | null;
  right: Clock | null;
  id: Clock | null;
  delete: boolean;
  value: string;
}

export class DiamondArray implements DiamondStructure {
  static structureCtorId: string = "DiamondArray";
  private data: { id: Clock; value: string }[] = [];
  constructor(
    public structureName: string,
    private context: IDiamondDocContext
  ) {}

  [update](operations: DiamondArrayOperation[]) {
    const nodeMap = new Map<string | null, LinkNode>();
    nodeMap.set(null, {
      left: null,
      right: null,
      id: null,
      delete: true,
      value: "",
    });
    for (const op of operations) {
      switch (op.type) {
        case "addRight": {
          const leftNode = nodeMap.get(op.left ? op.left.toString() : null)!;
          const originRight = leftNode.right;
          leftNode.right = op.id;
          const insertNode: LinkNode = {
            left: leftNode.id,
            id: op.id,
            delete: false,
            right: originRight,
            value: op.value,
          };
          nodeMap.set(op.id.toString(), insertNode);
          if (originRight) {
            nodeMap.get(originRight.toString())!.left = insertNode.id;
          }
          break;
        }
        case "remove": {
          nodeMap.get(op.removeId.toString())!.delete = true;
        }
      }
    }
    const data: { id: Clock; value: string }[] = [];
    let flag = null;

    while (true) {
      const node = nodeMap.get(flag ? flag.toString() : flag);
      if (!node?.delete && node?.id) {
        data.push({
          id: node.id,
          value: node.value,
        });
      }
      if (!node?.right) {
        break;
      } else {
        flag = node.right;
      }
    }
    this.data = data;
    return this;
  }

  push(value: string): void {
    if (this.data.length === 0) {
      this.makeAddRightOperation(null, value);
    } else {
      this.makeAddRightOperation(this.data.length - 1, value);
    }
  }

  remove(index: number): void {
    const id = this.context.tick();
    const removedItem = this.data[index].id;
    const op: DiamondArrayRemove = {
      id,
      structureCtorId: DiamondArray.structureCtorId,
      structureName: this.structureName,
      type: "remove",
      removeId: removedItem,
    };
    this.context.appendOperation(op);
    this.data.splice(index, 1);
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
      this.data.splice(index + 1, 0, data);
    }
  }

  toJS() {
    return this.data.map((p) => p.value);
  }
}
