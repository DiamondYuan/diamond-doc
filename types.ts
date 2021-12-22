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
  create<T>(name: string, factory: DiamondStructureConstructor<T>): T;
  getByVersion(version: Version): DiamondDoc;
  merge(other: DiamondDoc): this;
}
