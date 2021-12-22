export interface Clock {
  readonly actorId: string;
  readonly number: number;
}

export interface Operation {
  id: Clock;
}

export interface DiamondStructureConstructor<T> {
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
