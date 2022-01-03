import { VendorClock } from "./../vendor-clock";
import { Clock } from "../clock";
import { generateUuid } from "../uuid";
import {
  IDiamondDoc,
  Operation,
  DiamondStructure,
  DiamondStructureCtor,
  IDiamondDocContext,
  update,
  IDiamondDocVersion,
  ValueDescription,
} from "../types";
import { mergeAndSortOperations } from "../utils/merge";
import { getOrCreateFromMap } from "../utils/get-or-create";
import { getValueDescription, getValue } from "../utils/value-description";

export class DiamondDoc implements IDiamondDoc {
  private _operations: Operation[];
  private ctx: IDiamondDocContext;
  private _clock: Clock;
  private ctorMap: Map<string, DiamondStructureCtor<DiamondStructure>> =
    new Map();
  private structureMap: Map<string, Map<string, DiamondStructure>> = new Map();
  private vendorClock: VendorClock = new VendorClock();

  get version(): IDiamondDocVersion {
    return this.vendorClock.version();
  }
  constructor(
    _operations: Operation[],
    ctors: DiamondStructureCtor<DiamondStructure>[]
  ) {
    this._clock = new Clock(generateUuid());
    this._operations = _operations;
    this.ctx = this.createContext();
    ctors.forEach((ctor) => {
      this.ctorMap.set(ctor.structureCtorId, ctor);
    });
    this.build();
  }

  get operations() {
    return this._operations;
  }

  get<T extends DiamondStructure>(
    Factory: DiamondStructureCtor<T>,
    structureName?: string
  ): T {
    const name: string = structureName ?? this._clock.tick().toString();
    return getOrCreateFromMap<T>(
      this.structureMap,
      Factory.structureCtorId,
      name,
      () => {
        const Ctor = this.ctorMap.get(Factory.structureCtorId)!;
        return new Ctor(name, this.ctx);
      }
    );
  }

  private getStructure<T extends DiamondStructure>(
    structureCtorId: string,
    structureName: string
  ): T {
    return getOrCreateFromMap<T>(
      this.structureMap,
      structureCtorId,
      structureName,
      () => {
        const Ctor = this.ctorMap.get(structureCtorId)!;
        return new Ctor(structureName, this.ctx);
      }
    );
  }

  merge(other: IDiamondDoc) {
    const _operations = mergeAndSortOperations(
      this._operations,
      other.operations
    );
    this._operations = _operations;
    this.build();
    return this;
  }

  private build() {
    const operations: Operation[] = this.operations;
    // Map<structureCtorId,<structureCtorId,DiamondStructure>>
    const operationsMap: Map<string, Map<string, Operation[]>> = new Map();
    operations.forEach((o) => {
      this.vendorClock.merge(o.id);
      getOrCreateFromMap<Operation[]>(
        operationsMap,
        o.structureCtorId,
        o.structureName,
        () => []
      ).push(o);
      this._clock = this._clock.merge(Clock.decode(o.id));
    });
    for (const [structureCtorId, structuresMap] of operationsMap.entries()) {
      for (const [
        structureName,
        structureOperations,
      ] of structuresMap.entries()) {
        const structure = this.get(
          this.ctorMap.get(structureCtorId)!,
          structureName
        );
        structure[update](structureOperations);
      }
    }
  }

  private createContext(): IDiamondDocContext {
    const that = this;
    return {
      tick: () => this._clock.tick(),
      appendOperation: (operation: Operation) => {
        this._operations.push(operation);
      },
      getRawValue: (v: ValueDescription) => {
        return getValue(v, (structureCtorId: string, structureName: string) => {
          return that.getStructure(structureCtorId, structureName);
        });
      },
      getValueDescription,
    };
  }
}
