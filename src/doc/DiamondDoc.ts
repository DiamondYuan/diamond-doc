import { EditStack, EditStackCtor } from "./../undo";
import { VendorClock } from "./../vendor-clock";
import { Clock, EncodedClock } from "../clock";
import { generateUuid, isUUID } from "../base/uuid";
import {
  IDiamondDoc,
  Operation,
  DiamondStructure,
  DiamondStructureCtor,
  IDiamondDocContext,
  IDiamondDocVersion,
  ValueDescription,
  DiamondDocOptions,
  StructureOperation,
  DocumentOperation,
} from "../types";
import { UPDATE, UNDO, REDO } from "../constants";
import { mergeAndSortOperations } from "../utils/merge";
import { getOrCreateFromMap } from "../utils/get-or-create";
import { getValueDescription, getValue } from "../utils/value-description";
import { isStructureOperation } from "..//utils/is-diamond-structure";
import { StructureStore } from "./structure-store";
import { groupByCtorAndName } from "../utils/filter-operations";

export interface UndoOperation extends DocumentOperation {
  type: "undo";
  ids: EncodedClock[];
}

export interface RedoOperation extends DocumentOperation {
  type: "redo";
  ids: EncodedClock[];
}

type DiamondDocOperation = UndoOperation | RedoOperation;

class StructureStoreMap {
  private structureEditorStackMap: Map<string, Map<string, StructureStore>> =
    new Map();

  get(structureCtorId: string, name: string): StructureStore {
    return getOrCreateFromMap(
      this.structureEditorStackMap,
      structureCtorId,
      name,
      () => {
        return new StructureStore(structureCtorId, name);
      }
    );
  }
  forEach(cb: any) {
    for (const [
      structureCtorId,
      structuresMap,
    ] of this.structureEditorStackMap.entries()) {
      for (const [
        structureName,
        structureOperationsStore,
      ] of structuresMap.entries()) {
        cb(structureOperationsStore, structureCtorId, structureName);
      }
    }
  }

  append(op: StructureOperation) {
    this.get(op.structureCtorId, op.structureName).append(op);
  }
}

export class DiamondDoc implements IDiamondDoc {
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
  private structureStoreMap: StructureStoreMap;
  private docOps: DiamondDocOperation[] = [];
  constructor(
    operations: Operation[],
    ctors: DiamondStructureCtor<DiamondStructure>[],
    protected options?: DiamondDocOptions
  ) {
    const actorId = options?.actorId ?? generateUuid();
    if (!isUUID(actorId)) {
      throw new Error("actorId should be uuid");
    }
    this._clock = new Clock(options?.actorId ?? generateUuid());
    ctors.forEach((ctor) => {
      this.ctorMap.set(ctor.structureCtorId, ctor);
    });
    this.structureStoreMap = new StructureStoreMap();
    this.build(operations);
  }

  get clock() {
    return this._clock.encode();
  }

  get operations() {
    let res: Operation[] = this.docOps;
    this.structureStoreMap.forEach((e: any) => {
      res = res.concat(e.ops);
    });
    return res.sort((a, b) => {
      return Clock.compare(a.id, b.id);
    });
  }

  get<T extends DiamondStructure>(
    Factory: DiamondStructureCtor<T>,
    structureName?: string
  ): T {
    const name: string = structureName ?? this._clock.tick().toString();
    return this.getStructure(Factory.structureCtorId, name);
  }

  merge(other: IDiamondDoc) {
    this.build(mergeAndSortOperations(this.operations, other.operations));
    return this;
  }

  protected getTime(): number | undefined {
    if (this.options?.time) {
      return Date.now();
    }
    return;
  }

  createOperationManager(Ctor: EditStackCtor, name?: string): EditStack {
    const managerName = name ?? generateUuid();
    const handler = (s: DiamondStructure) => {
      getOrCreateFromMap(
        this.structureEditorStackMap,
        s.structureCtorId,
        s.structureName,
        () => {
          return managerName;
        }
      );
    };
    const editStack = new Ctor({
      name: managerName,
      handlerTrack: handler,
      handleRedo: this.handleRedo.bind(this),
      handleUndo: this.handleUndo.bind(this),
    });
    this.editorStackMap.set(editStack.name, editStack);
    return editStack;
  }

  private hasStructure(id: string, name: string) {
    return this.structureMap.get(id)?.has(name);
  }

  private handleUndo(ops: StructureOperation[]) {
    const clock = this._clock.tick();
    const undo: UndoOperation = {
      id: clock.encode(),
      type: "undo",
      ids: ops.map((o) => o.id),
      time: this.getTime(),
    };
    groupByCtorAndName(ops, (id, name, ops) => {
      if (this.hasStructure(id, name)) {
        this.getStructure(id, name)[UNDO](ops);
      }
    });
    this.appendDocOp(undo);
  }

  private appendDocOp(op: RedoOperation | UndoOperation) {
    this.docOps.push(op);
    this._clock.merge(Clock.decode(op.id));
    this.vendorClock.merge(op.id);
  }

  private handleRedo(ops: StructureOperation[]) {
    const clock = this._clock.tick();
    const undo: RedoOperation = {
      id: clock.encode(),
      type: "redo",
      ids: ops.map((o) => o.id),
      time: this.getTime(),
    };
    groupByCtorAndName(ops, (id, name, ops) => {
      if (this.hasStructure(id, name)) {
        this.getStructure(id, name)[REDO](ops);
      }
    });
    this.appendDocOp(undo);
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
        const imp = new Ctor(
          structureName,
          this.createContext(structureCtorId, structureName)
        );
        imp[UPDATE](
          this.structureStoreMap.get(structureCtorId, structureName).ops
        );
        return imp;
      }
    );
  }

  private build(operations: Operation[]) {
    const map = new Map<string, StructureOperation>();
    const structureStoreMap = new StructureStoreMap();
    const structureOperations: StructureOperation[] = [];
    for (const op of operations) {
      this._clock = this._clock.merge(Clock.decode(op.id));
      this.vendorClock.merge(op.id);
      if (isStructureOperation(op)) {
        structureOperations.push(op);
        map.set(Clock.decode(op.id).toString(), op);
        structureStoreMap.append(op);
      } else {
        const docOp = op as DiamondDocOperation;
        switch (docOp.type) {
          case "undo": {
            docOp.ids.forEach((i) => {
              map.get(Clock.decode(i).toString())!.delete = true;
            });
            break;
          }
          case "redo": {
            docOp.ids.forEach((i) => {
              map.get(Clock.decode(i).toString())!.delete = false;
            });
            break;
          }
        }
      }
    }
    structureStoreMap.forEach(
      (
        store: StructureStore,
        structureCtorId: string,
        structureName: string
      ) => {
        if (this.hasStructure(structureCtorId, structureName)) {
          const structure = this.get(
            this.ctorMap.get(structureCtorId)!,
            structureName
          );
          structure[UPDATE](store.ops);
        }
      }
    );
    this.structureStoreMap = structureStoreMap;
  }

  private createContext(
    structureCtorId: string,
    structureName: string
  ): IDiamondDocContext {
    const that = this;
    return {
      tick: () => this._clock.tick(),
      getTime: () => that.getTime(),
      appendOperation: (operation: StructureOperation) => {
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
        this.structureStoreMap.append(operation);
      },
      getRawValue: (v: ValueDescription) => {
        return getValue(v, (structureCtorId: string, structureName: string) => {
          return that.getStructure(structureCtorId, structureName);
        });
      },
      getValueDescription,
      getStore() {
        return that.structureStoreMap.get(structureCtorId, structureName);
      },
    };
  }
}
