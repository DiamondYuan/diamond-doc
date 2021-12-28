import { IClock } from "./clock";
export interface Operation {
  id: IClock;
  structureName: string;
  structureCtorId: string;
}

export interface IDiamondDocContext {
  tick: () => IClock;
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
   *
   */
  readonly structureName: string;
  [update](operations: Operation[]): this;
}

export interface IDiamondDoc {
  readonly operations: Operation[];
  get<T extends DiamondStructure>(
    structureName: string,
    ctor: DiamondStructureCtor<T>
  ): T;
  merge(other: IDiamondDoc): this;
}
