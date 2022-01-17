import { StructureOperation } from "../types";
import { Clock, EncodedClock } from "../clock";
import { VendorClock } from "../vendor-clock";
import { binarySearchOperation } from "../base/array";

export class StructureStore {
  public ops: StructureOperation[] = [];
  private vendorClock: VendorClock;
  constructor(public structureCtorId: string, public name: string) {
    this.vendorClock = new VendorClock();
  }

  append(op: StructureOperation) {
    this.ops.push(op);
    this.vendorClock.merge(op.id);
  }

  redo(id: EncodedClock) {
    const op = this.getOperationsById(id);
    if (op) {
      this.vendorClock.merge(id);
      op.delete = false;
    }
  }

  undo(id: EncodedClock) {
    const op = this.getOperationsById(id);
    if (op) {
      this.vendorClock.merge(id);
      op.delete = true;
    }
  }

  private getOperationsById(id: EncodedClock): StructureOperation | null {
    const index = binarySearchOperation(this.ops, Clock.decode(id));
    if (index === -1) {
      return null;
    }
    return this.ops[index];
  }
}
