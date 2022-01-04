import { Operation, DiamondStructure } from "./types";

export interface EditStack {
  pushStackElement(): void;

  undo(): boolean;
  canUndo(): boolean;
  redo(): void;
  canRedo(): boolean;

  applyOperation(op: Operation): void;
  track(structure: DiamondStructure): void;
}
