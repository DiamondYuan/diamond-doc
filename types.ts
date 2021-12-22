interface Clock {}

interface Operation {
  id: Clock;
}

interface DiamondStructureConstructor<T> {
  new (): T;
}

interface DiamondStructure {}

interface DiamondDoc {
  create<T>(name: string, factory: DiamondStructureConstructor<T>): T;
  readonly operations: Operation[];
  merge(other: DiamondDoc): this;
}
