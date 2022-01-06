import { Operation, DiamondStructure } from "./types";



export interface UndoManagerOption {
  name: string;
  handlerTrack: (structure: DiamondStructure) => void
  handleUndo(ops: Operation[]): void
  handleRedo(ops: Operation[]): void
}



export interface EditStackCtor {
  new(options: UndoManagerOption): EditStack;
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

export class EditStackService {

  private operations: Operation[] = []
  private undoStack: Array<Operation[]> = []
  private redoStack: Array<Operation[]> = []

  constructor(
    private options: UndoManagerOption
  ) {
    this.operations = []
  }

  get name() {
    return this.options.name
  }

  pushStackElement() {
    const undoLogs = [...this.operations];
    this.undoStack.push(undoLogs)
    this.operations = []
  }

  redo() {
    if (!this.canRedo()) {
      return
    }
    const stack = this.redoStack.pop()!;
    this.options.handleRedo(stack)
  }

  canUndo() {
    return this.operations.length > 0 || this.undoStack.length > 0
  }

  canRedo() {
    return this.redoStack.length > 0
  }

  undo() {
    if (!this.canUndo()) {
      return
    }
    let undoLogs = [...this.operations];
    if (undoLogs.length === 0) {
      undoLogs = this.undoStack.pop()!;
    }
    this.options.handleUndo(undoLogs)
    this.operations = []
    this.redoStack.push(undoLogs)
  }

  track(structure: DiamondStructure): void {
    this.options.handlerTrack(structure)
  }
  applyOperation(op: Operation): void {
    this.operations.push(op)
  }
}

