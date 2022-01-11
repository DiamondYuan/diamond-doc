import { EncodedClock } from "./../clock";
import {
  DiamondDocDataType,
  DiamondDocValueType,
  ValueDescription,
  DiamondStructure,
  IDiamondDocContext,
  StructureOperation,
} from "./../types";
import { UPDATE, UNDO, REDO } from "../constants";

export interface DiamondArrayAddRight extends StructureOperation {
  type: "addRight";
  left: EncodedClock | null;
  value: ValueDescription;
}

export interface DiamondArrayRemove extends StructureOperation {
  type: "remove";
  removeId: EncodedClock;
}

export type DiamondArrayOperation = DiamondArrayAddRight | DiamondArrayRemove;

interface LinkNode {
  left: EncodedClock | null;
  right: EncodedClock | null;
  id: EncodedClock | null;
  delete: boolean;
  value: ValueDescription;
}

export class DiamondArray implements DiamondStructure {
  static structureCtorId: string = "DiamondArray";
  public readonly structureCtorId = "DiamondArray";
  private data: { id: EncodedClock; value: ValueDescription }[] = [];
  constructor(
    public structureName: string,
    private context: IDiamondDocContext
  ) {}

  [UNDO](operations: DiamondArrayOperation[]) {
    const store = this.context.getStore();
    for (const op of operations) {
      store.undo(op.id);
    }
    this[UPDATE](store.ops as DiamondArrayOperation[]);
  }
  [REDO](operations: DiamondArrayOperation[]) {
    const store = this.context.getStore();
    for (const op of operations) {
      store.redo(op.id);
    }
    this[UPDATE](store.ops as DiamondArrayOperation[]);
  }

  [UPDATE](operations: DiamondArrayOperation[]) {
    const nodeMap = new Map<string | null, LinkNode>();
    nodeMap.set(null, {
      left: null,
      right: null,
      id: null,
      delete: true,
      value: {
        type: DiamondDocDataType.null,
      },
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
            delete: !!op.delete,
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
          if (!op.delete) {
            nodeMap.get(op.removeId.toString())!.delete = true;
          }
          break;
        }
        default: {
          /* istanbul ignore next */
          const _op: never = op;
          /* istanbul ignore next */
          throw new Error(`unknown op: ${JSON.stringify(op)}`);
        }
      }
    }
    const data: { id: EncodedClock; value: ValueDescription }[] = [];
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
  }

  push(value: DiamondDocValueType): void {
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
      id: id.encode(),
      type: "remove",
      removeId: removedItem,
      structureCtorId: this.structureCtorId,
      structureName: this.structureName,
    };
    this.context.appendOperation(op);
    this.data.splice(index, 1);
  }

  insert(leftIndex: number, value: DiamondDocValueType): void {
    this.makeAddRightOperation(leftIndex, value);
  }
  unshift(value: DiamondDocValueType): void {
    this.makeAddRightOperation(null, value);
  }

  private makeAddRightOperation(
    index: null | number,
    value: DiamondDocValueType
  ): void {
    let left: EncodedClock | null = null;
    if (index !== null) {
      left = this.data[index].id;
    }
    const id = this.context.tick();
    const op: DiamondArrayAddRight = {
      id: id.encode(),
      type: "addRight",
      value: this.context.getValueDescription(value),
      left,
      structureCtorId: this.structureCtorId,
      structureName: this.structureName,
    };
    this.context.appendOperation(op);
    const data = {
      id: id.encode(),
      value: this.context.getValueDescription(value),
    };
    if (index === null) {
      this.data.unshift(data);
    } else {
      this.data.splice(index + 1, 0, data);
    }
  }

  toJS(): DiamondDocValueType[] {
    return this.data.map((p) => this.context.getRawValue(p.value));
  }
}
