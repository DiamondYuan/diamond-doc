import { Clock } from "./clock";
import { generateUuid } from "./uuid";
import {
  IDiamondDoc,
  Operation,
  DiamondStructure,
  DiamondStructureCtor,
  IDiamondDocContext,
} from "./types";
import { mergeAndSortOperations } from "./utils/merge";

export class DiamondDoc implements IDiamondDoc {
  private _operations: Operation[];
  private ctx: IDiamondDocContext;
  private _clock: Clock;
  constructor(_operations: Operation[]) {
    this._clock = new Clock(generateUuid());
    this._operations = _operations;
    this.ctx = {
      tick: () => this._clock.tick(),
      appendOperation: (operation) => {
        this._operations.push(operation);
      },
    };
  }

  get operations() {
    return this._operations;
  }

  get<T extends DiamondStructure>(
    name: string,
    Factory: DiamondStructureCtor<T>
  ): T {
    return new Factory(name, this.ctx);
  }

  merge(other: IDiamondDoc) {
    const _operations = mergeAndSortOperations(
      this._operations,
      other.operations
    );
    this._operations = _operations;
    return this;
  }
}
