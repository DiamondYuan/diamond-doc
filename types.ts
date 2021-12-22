interface Clock {}

interface Operation {
  id: Clock;
}

interface DiamondStructureConstructor<T> {
  new (): T;
}

interface DiamondStructure {}

interface Version {
  [key: string]: number;
}
interface DiamondDoc {
  version: Version;
  readonly operations: Operation[];
  get<T>(name: string, factory: DiamondStructureConstructor<T>): T;
  merge(other: DiamondDoc): this;
}
