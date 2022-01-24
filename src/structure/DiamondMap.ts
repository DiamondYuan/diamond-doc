import {
  ValueDescription,
  DiamondDocValueType,
  DiamondStructure,
  IDiamondDocContext,
  StructureOperation,
} from "../types";
import { UPDATE, UNDO, REDO } from "../constants";
import { SchemaType } from "src/base/type";

export interface DiamondMap_Set extends StructureOperation {
  type: "set";
  key: string;
  value: ValueDescription;
}

export interface DiamondMap_Del extends StructureOperation {
  type: "delete";
  key: string;
}

export type DiamondMapOperation = DiamondMap_Set | DiamondMap_Del;

type ValueType<S, K extends keyof S, D> = S[K] extends D ? S[K] : D;

type ExcludeScheme<T, S> = T extends keyof S ? "key is reserved!" : T;

export class DiamondMap<
  S extends SchemaType<S> = {},
  D extends DiamondDocValueType = DiamondDocValueType
> implements DiamondStructure
{
  static structureCtorId: string = "DiamondMap";
  public readonly structureCtorId = "DiamondMap";
  private data: Map<string, ValueDescription>;
  constructor(
    public structureName: string,
    private context: IDiamondDocContext
  ) {
    this.data = new Map<string, ValueDescription>();
  }
  [REDO](operations: DiamondMapOperation[]) {
    const store = this.context.getStore();
    for (const op of operations) {
      store.redo(op.id);
    }
    this[UPDATE](store.ops as DiamondMapOperation[]);
  }
  [UNDO](operations: DiamondMapOperation[]) {
    const store = this.context.getStore();
    for (const op of operations) {
      store.undo(op.id);
    }
    this[UPDATE](store.ops as DiamondMapOperation[]);
  }

  [UPDATE](operations: DiamondMapOperation[]) {
    const data = new Map<string, ValueDescription>();
    for (const op of operations) {
      switch (op.type) {
        case "set": {
          if (!op.delete) {
            data.set(op.key, op.value);
          }
          break;
        }
        case "delete": {
          if (!op.delete) {
            data.delete(op.key);
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
    this.data = data;
  }

  set<K extends keyof S>(key: K, value: S[K]): void;
  set<T extends string>(key: ExcludeScheme<T, S>, value: D): void;
  set(key: string, value: DiamondDocValueType) {
    const internalValue = this.context.wrapValue(value);
    const op: DiamondMap_Set = {
      id: this.context.tick().encode(),
      key: key,
      value: internalValue,
      type: "set",
      structureCtorId: this.structureCtorId,
      structureName: this.structureName,
      time: this.context.getTime(),
    };
    this.context.appendOperation(op);
    this.data.set(key, internalValue);
  }

  delete<K extends keyof S>(key: K): void;
  delete(key: string): void;
  delete(key: string) {
    const op: DiamondMap_Del = {
      id: this.context.tick().encode(),
      type: "delete",
      key: key,
      structureCtorId: this.structureCtorId,
      structureName: this.structureName,
      time: this.context.getTime(),
    };
    this.context.appendOperation(op);
    this.data.delete(key);
  }

  get<K extends keyof S>(key: K): ValueType<S, K, D> | undefined;
  get<V>(key: string): V;
  get(key: string): DiamondDocValueType | undefined {
    if (this.data.has(key)) {
      return this.context.unwrapValue(this.data.get(key)!);
    }
  }

  toJS(): Partial<S> & Record<string | number, D> {
    const js: Partial<S> & Record<string | number, D> = {};
    this.data.forEach((value, key: any) => {
      js[key] = this.context.unwrapValue(value) as any;
    });
    return js;
  }
}
