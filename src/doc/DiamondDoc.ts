import { EditStack } from "./../undo";
import { VendorClock } from "./../vendor-clock";
import { Clock } from "../clock";
import { generateUuid } from "../base/uuid";
import {
  IDiamondDoc,
  Operation,
  DiamondStructure,
  DiamondStructureCtor,
  IDiamondDocContext,
  IDiamondDocVersion,
  ValueDescription,
} from "../types";
import { UPDATE } from "../constants";
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
  private structureEditorStackMap: Map<string, Map<string, DiamondStructure>> =
    new Map();
  private editorStackMap: Map<string, EditStack> = new Map();

  private vendorClock: VendorClock = new VendorClock();
  get version(): IDiamondDocVersion {
    return this.vendorClock.version();
  }
  constructor(
    _operations: Operation[],
    ctors: DiamondStructureCtor<DiamondStructure>[],
    options?: {
      /**
       * this comment is copy from https://github.com/automerge/automerge/blob/4068e96724756e0d32c11ef0680d26204f23e2e1/README.md
       *
       * Copyright (c) 2017-2021 Martin Kleppmann, Ink & Switch LLC, and the Automerge contributors
       *
       * The `actorId` is a string that uniquely identifies the current node; if you omit `actorId`, a
       * random UUID is generated. If you pass in your own `actorId`, you must ensure that there can never
       * be two different processes with the same actor ID. Even if you have two different processes
       * running on the same machine, they must have distinct actor IDs.
       *
       * **Unless you know what you are doing, you should stick with the default**, and let `actorId` be auto-generated.
       */
      actorId?: string;
    }
  ) {
    this._clock = new Clock(options?.actorId ?? generateUuid());
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
        structure[UPDATE](structureOperations);
      }
    }
  }

  private createContext(): IDiamondDocContext {
    const that = this;
    return {
      tick: () => this._clock.tick(),
      appendOperation: (operation: Operation) => {
        this.vendorClock.merge(operation.id);
        const editStackName = getOrCreateFromMap(
          this.structureEditorStackMap,
          operation.structureCtorId,
          operation.structureName,
          () => {
            return null;
          }
        ) as string;
        if (editStackName) {
          this.editorStackMap.get(editStackName)?.applyOperation(operation);
        }
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

  createOperationManager(name: string): EditStack {
    const editStack = { name: name } as any as EditStack;
    this.editorStackMap.set(editStack.name, editStack);
    editStack.onTrack((s) => {
      getOrCreateFromMap(
        this.structureEditorStackMap,
        s.structureCtorId,
        s.structureName,
        () => {
          return name;
        }
      );
    });
    return editStack;
  }
}
