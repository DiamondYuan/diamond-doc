import { StructureOperation } from "../types";
import { Clock, EncodedClock } from "../clock";
import { VendorClock } from "../vendor-clock";

export class StructureStore {
  public ops: StructureOperation[] = [];
  private vendorClock: VendorClock;
  private structureOperationMap: Map<string, StructureOperation> = new Map<
    string,
    StructureOperation
  >();
  constructor(public structureCtorId: string, public name: string) {
    this.vendorClock = new VendorClock();
  }

  append(op: StructureOperation) {
    this.ops.push(op);
    this.vendorClock.merge(op.id);
    this.structureOperationMap.set(Clock.decode(op.id).toString(), op);
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
    return this.structureOperationMap.get(Clock.decode(id).toString()) ?? null;
  }
}
