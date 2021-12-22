import { IClock } from "./clock";
export interface Operation {
  id: IClock;
}

export interface DiamondStructureConstructor<T> {
  /**
   * Each type has a different id
   */
  id: string;
  new (): T;
}

export interface DiamondStructure {}

export interface DiamondDocVersion {
  [key: string]: number;
}
export interface IDiamondDoc {
  readonly version: DiamondDocVersion;
  readonly operations: Operation[];
  get<T>(name: string, factory: DiamondStructureConstructor<T>): T;
  merge(other: IDiamondDoc): this;
}
