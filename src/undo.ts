import { Operation, DiamondStructure } from "./types";

export interface EditStackCtor {
  new (name: string, handler: (structure: DiamondStructure) => void): EditStack;
}
export interface EditStack {
  readonly name: string;
  pushStackElement(): void;

  undo(): boolean;
  canUndo(): boolean;
  redo(): void;
  canRedo(): boolean;

  applyOperation(op: Operation): void;
  track(structure: DiamondStructure): void;
}

function te(ctor: EditStackCtor) {}

export class EditStackService {
  constructor(
    public name: string,
    handler: (structure: DiamondStructure) => void
  ) {}
}

te(EditStackService);
