import { Operation, DiamondStructure } from "./types";

export interface EditStackCtor {
  new (name: string, handler: (structure: DiamondStructure) => void): EditStack;
}
export interface EditStack {
  readonly name: string;
  pushStackElement(): void;

  undo(): void;
  canUndo(): boolean;
  redo(): void;
  canRedo(): boolean;

  applyOperation(op: Operation): void;
  track(structure: DiamondStructure): void;
}

function testEditStackCtor(ctor: EditStackCtor) {}

export class EditStackService {
  constructor(
    public name: string,
    handler: (structure: DiamondStructure) => void
  ) {}

  pushStackElement() {}

  redo() {}

  canUndo() {
    return false;
  }

  canRedo() {
    return false;
  }

  undo() {}

  track(structure: DiamondStructure): void {}

  applyOperation(op: Operation): void {}
}

testEditStackCtor(EditStackService);
