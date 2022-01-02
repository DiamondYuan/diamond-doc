import { Clock } from "./clock";
export interface Operation {
  id: Clock;
  structureName: string;
  structureCtorId: string;
}

export interface IDiamondDocContext {
  tick: () => Clock;
  appendOperation(operation: Operation): void;
}

export interface DiamondStructureCtor<T extends DiamondStructure> {
  /**
   * Each type has a different id
   */
  readonly structureCtorId: string;
  new (structureName: string, context: IDiamondDocContext): T;
}

export const update: unique symbol = Symbol("update");

export interface DiamondStructureUpdateOptions {}
export interface DiamondStructure {
  /**
   * Each type has a different id
   */
  readonly structureCtorId: string;
  readonly structureName: string;
  [update](operations: Operation[]): this;
  toJS(): unknown;
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
