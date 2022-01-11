import { StructureOperation } from "../types";
import { Clock, EncodedClock } from "../clock";
import { VendorClock } from "../vendor-clock";

function binarySearch(arr: StructureOperation[], target: Clock) {
  if (arr.length < 1) return -1;
  let lowIndex = 0;
  let highIndex = arr.length - 1;

  while (lowIndex <= highIndex) {
    const midIndex = Math.floor((lowIndex + highIndex) / 2);
    if (target < Clock.decode(arr[midIndex].id)) {
      highIndex = midIndex - 1;
    } else if (target > Clock.decode(arr[midIndex].id)) {
      lowIndex = midIndex + 1;
    } else {
      return midIndex;
    }
  }
  return -1;
}
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
    const index = binarySearch(this.ops, Clock.decode(id));
    if (index === -1) {
      return null;
    }
    return this.ops[index];
  }
}
