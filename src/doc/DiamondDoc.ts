import { EditStack, EditStackCtor } from "./../undo";
import { VendorClock } from "./../vendor-clock";
import { Clock, EncodedClock } from "../clock";
import { generateUuid } from "../base/uuid";
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
  DocumentOperation
} from "../types";
import { UPDATE } from "../constants";
import { mergeAndSortOperations } from "../utils/merge";
import { getOrCreateFromMap } from "../utils/get-or-create";
import { getValueDescription, getValue } from "../utils/value-description";
import { isDiamondStructure, isDocumentOperation, isStructureOperation } from "..//utils/is-diamond-structure";

export interface UndoOperation extends DocumentOperation {
  type: 'undo'
  ids: EncodedClock[]

}

export interface RedoOperation extends DocumentOperation {
  type: 'redo'
  ids: EncodedClock[]
}

type DiamondDocOperation = UndoOperation | RedoOperation

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
    options?: DiamondDocOptions
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

  merge(other: IDiamondDoc) {
    const _operations = mergeAndSortOperations(
      this._operations,
      other.operations
    );
    this._operations = _operations;
    this.build();
    return this;
  }

  createOperationManager(Ctor: EditStackCtor, name?: string): EditStack {
    const managerName = name ?? generateUuid()
    const handler = (s: DiamondStructure) => {
      getOrCreateFromMap(
        this.structureEditorStackMap,
        s.structureCtorId,
        s.structureName,
        () => {
          return managerName;
        }
      );
    }
    const editStack = new Ctor({
      name: managerName,
      handlerTrack: handler,
      handleRedo: this.handleRedo.bind(this),
      handleUndo: this.handleUndo.bind(this)
    });
    this.editorStackMap.set(editStack.name, editStack);
    return editStack;
  }

  private handleUndo(ops: StructureOperation[]) {
    const undo: UndoOperation = {
      id: this._clock.tick().encode(),
      type: 'undo',
      ids: ops.map(o => o.id)
    }
    this.operations.push(undo)
    this.build()
  }

  private handleRedo(ops: StructureOperation[]) {
    const redo: RedoOperation = {
      id: this._clock.tick().encode(),
      type: 'redo',
      ids: ops.map(o => o.id)
    }
    this.operations.push(redo)
    this.build()
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

  private build() {
    const operations: Operation[] = this.operations;
    const structureOperations: StructureOperation[] = operations.filter(o => isStructureOperation(o)) as StructureOperation[];
    const documentOperations: DiamondDocOperation[] = operations.filter(o => isDocumentOperation(o)) as DiamondDocOperation[];
    const map = new Map<string, StructureOperation>();
    structureOperations.forEach(op => {
      map.set(Clock.decode(op.id).toString(), op);
    })
    operations.forEach(op => {
      this._clock = this._clock.merge(Clock.decode(op.id));
      this.vendorClock.merge(op.id);
    })
    documentOperations.forEach(docOp => {
      switch (docOp.type) {
        case 'undo': {
          docOp.ids.forEach(i => {
            map.get(Clock.decode(i).toString())!.delete = true
          })
          break
        }
        case 'redo': {
          docOp.ids.forEach(i => {
            map.get(Clock.decode(i).toString())!.delete = false
          })
          break
        }
      }
    })
    const operationsMap: Map<string, Map<string, Operation[]>> = new Map();
    structureOperations.forEach((o) => {
      this.vendorClock.merge(o.id);
      getOrCreateFromMap<Operation[]>(
        operationsMap,
        o.structureCtorId,
        o.structureName,
        () => []
      ).push(o);
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
