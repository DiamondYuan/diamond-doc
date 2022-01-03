import { Clock, EncodedClock } from "./clock";
import { UPDATE } from "./constants";
export interface Operation {
  id: EncodedClock;
  structureName: string;
  structureCtorId: string;
}
export interface IDiamondDocContext {
  tick: () => Clock;
  appendOperation(operation: Operation): void;
  getValueDescription(value: DiamondDocValueType): ValueDescription;
  getRawValue(value: ValueDescription): DiamondDocValueType;
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
  [UPDATE](operations: Operation[]): this;
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
