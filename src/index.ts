import {
  IDiamondDoc,
  Operation,
  DiamondDocVersion,
  DiamondStructureConstructor,
} from "./types";

export class DiamondDoc implements IDiamondDoc {
  private _operations: Operation[];
  private _version: DiamondDocVersion;
  constructor(_operations: Operation[]) {
    this._operations = _operations;
    this._version = {};
  }

  get version() {
    return this._version;
  }

  get operations() {
    return this._operations;
  }

  get<T>(name: string, Factory: DiamondStructureConstructor<T>) {
    return new Factory();
  }

  merge(other: IDiamondDoc) {
    return this;
  }
}
