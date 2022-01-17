import { Clock, EncodedClock } from "./clock";
import { UPDATE, UNDO, REDO } from "./constants";
import { StructureStore } from "./doc/structure-store";

export interface BasicOperation {
  id: EncodedClock;
  type: string;
  time?: number;
}
export interface StructureOperation extends BasicOperation {
  structureName: string;
  structureCtorId: string;
  delete?: boolean;
}

export interface DocumentOperation extends BasicOperation {
  id: EncodedClock;
  structureName?: undefined;
  structureCtorId?: undefined;
}

export type Operation = StructureOperation | DocumentOperation;
export interface IDiamondDocContext {
  tick: () => Clock;
  appendOperation(operation: BasicOperation): void;
  getValueDescription(value: DiamondDocValueType): ValueDescription;
  getRawValue(value: ValueDescription): DiamondDocValueType;
  getStore(): StructureStore;
  getTime(): number | undefined;
}

export interface IDiamondDocVersion {
  [actorId: string]: number;
}
export interface IDiamondDoc {
  readonly version: IDiamondDocVersion;
  readonly operations: Operation[];
  get<T extends DiamondStructure>(
    ctor: DiamondStructureCtor<T>,
    structureName?: string
  ): T;
  merge(other: IDiamondDoc): this;
}

export interface DiamondStructureCtor<T extends DiamondStructure> {
  /**
   * Each type has a different id
   */
  readonly structureCtorId: string;
  new (structureName: string, context: IDiamondDocContext): T;
}
export interface DiamondStructure {
  /**
   * Each type has a different id
   */
  readonly structureCtorId: string;
  readonly structureName: string;
  [UPDATE](operations: BasicOperation[]): void;
  [UNDO](operations: BasicOperation[]): void;
  [REDO](operations: BasicOperation[]): void;
  toJS(): unknown;
}

export type DiamondDocValueType =
  | string
  | number
  | boolean
  | null
  | DiamondStructure;

export const enum DiamondDocDataType {
  "string" = 0,
  "int" = 1,
  "float64" = 2,
  "boolean" = 3,
  "null" = 4,
  "diamond" = 7,
}

export type ValueDescription =
  | {
      type:
        | DiamondDocDataType.string
        | DiamondDocDataType.int
        | DiamondDocDataType.float64;
      value: string;
    }
  | {
      type: DiamondDocDataType.boolean;
      value: boolean;
    }
  | {
      type: DiamondDocDataType.null;
    }
  | {
      type: DiamondDocDataType.diamond;
      structureName: string;
      structureCtorId: string;
    };

export interface DiamondDocOptions {
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
  /**
   * default: false
   */
  time?: boolean;
}
