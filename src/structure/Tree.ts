import { Clock } from "./../clock";
import {
  DiamondStructure,
  update,
  Operation,
  IDiamondDocContext,
} from "./../types";

enum Action {
  AddNode,
  Move,
}
export interface AddNode extends Operation {
  type: Action.AddNode;
  parentId: Clock | null;
  leftId: Clock | null;
  nodeType: string;
  char?: string;
}

export interface Move extends Operation {
  type: Action.Move;
  from: Clock;
  targetParent: Clock | null;
  targetLeftId: Clock | null;
}

export type DiamondTreeOperation = Move | AddNode;
export class DiamondTree implements DiamondStructure {
  static structureCtorId: string = "DiamondTree";
  constructor(
    public structureName: string,
    private context: IDiamondDocContext
  ) {}

  //记录子节点
  private children: Map<Clock | null, Clock[]> = new Map();
  //记录当前的 value
  private value: Map<
    Clock | null,
    {
      type: string;
      char?: string;
    }
  > = new Map();
  //记录节点当前所在的位置
  private parent: Map<Clock | null, Clock | null> = new Map();

  [update](operations: DiamondTreeOperation[]) {
    const children: Map<Clock | null, Clock[]> = new Map();
    const value: Map<Clock | null, { type: string; char?: string }> = new Map();
    const currentId: Map<Clock, Clock> = new Map();
    const parent: Map<Clock | null, Clock | null> = new Map();
    const logMap: Map<Clock, DiamondTreeOperation> = new Map();
    operations.forEach((e) => {
      logMap.set(e.id, e);
    });
    for (const log of operations) {
      switch (log.type) {
        case Action.AddNode: {
          value.set(log.id, { type: log.nodeType, char: log.char });
          const c = children.get(log.parentId) ?? [];
          const offset = c.findIndex((o) => o === log.leftId) + 1;
          c.splice(offset, 0, log.id);
          children.set(log.parentId, c);
          parent.set(log.id, log.parentId);
          break;
        }
        case Action.Move: {
          const oldParent = parent.get(log.from);
          const newParent = log.targetParent;
          const changeParent = oldParent === newParent;
          const ancestors: Clock[] = [];
          if (changeParent) {
            let p = currentId.get(log.targetParent!) ?? log.targetParent!;
            while (p) {
              ancestors.push(p);
              p = parent.get(currentId.get(p) ?? p)!;
            }
          }
          if (ancestors.every((o) => o !== log.from)) {
            parent.set(log.id, log.targetParent);
            currentId.set(log.from, log.id);
            const c = children.get(log.targetParent) ?? [];
            const offset = c.findIndex((o) => o === log.targetLeftId) + 1;
            c.splice(offset, 0, log.id);
            children.set(log.targetParent, c);
          }
        }
      }
    }
    this.parent = parent;
    this.children = children;
    this.value = value;
    return this;
  }

  move(
    parentsFrom: number[],
    offsetFrom: number,
    parentsTo: number[],
    offsetTo: number | null
  ) {
    const target = this.getByPath({
      parents: parentsTo,
      offset: offsetTo,
    });
    const from = this.getByPath({
      parents: parentsFrom,
      offset: offsetFrom,
    });
    this.parent.set(from.id!, target.parentId);
    //找到原先所在的数组，删除
    this.children.get(from.parentId)?.splice(offsetFrom, 1);

    const child = this.children.get(target.parentId)! ?? [];
    const offset =
      child.findIndex((o) => o.toString() === target.id?.toString()) + 1;
    child.splice(offset, 0, from.id!);
    this.children.set(target.parentId, child);

    const moveOp: Move = {
      type: Action.Move,
      id: this.context.tick(),
      structureCtorId: DiamondTree.structureCtorId,
      structureName: this.structureName,
      from: from.id!,
      targetParent: target.parentId,
      targetLeftId: target.id,
    };
    this.context.appendOperation(moveOp);
  }

  addNode(parents: number[], offset: number | null, type: "p" | "h1" | "h2") {
    const id = this.context.tick();
    this.value.set(id, { type: type });
    const target = this.getByPath({ parents, offset });
    if (!this.children.has(target.parentId)) {
      this.children.set(target.parentId, []);
    }
    const child = this.children.get(target.parentId)!;
    if (target.id === null) {
      child?.unshift(id);
    } else {
      const offset =
        child.findIndex((o) => o.toString() === target.id?.toString()) + 1;
      child.splice(offset, 0, id);
    }
    this.parent.set(id, target.parentId);

    const moveOp: AddNode = {
      type: Action.AddNode,
      id: id,
      structureCtorId: DiamondTree.structureCtorId,
      structureName: this.structureName,
      parentId: target.parentId,
      leftId: target.id,
      nodeType: type,
    };
    this.context.appendOperation(moveOp);
  }

  addText(parents: number[], offset: number | null, char: string) {
    const id = this.context.tick();
    this.value.set(id, { type: "text", char });
    const target = this.getByPath({ parents, offset });
    if (!this.children.has(target.parentId)) {
      this.children.set(target.parentId, []);
    }
    const child = this.children.get(target.parentId)!;
    if (target.id === null) {
      child?.unshift(id);
    } else {
      const offset =
        child.findIndex((o) => o.toString() === target.id?.toString()) + 1;
      child.splice(offset, 0, id);
    }
    this.parent.set(id, target.parentId);

    const moveOp: AddNode = {
      type: Action.AddNode,
      id: id,
      structureCtorId: DiamondTree.structureCtorId,
      structureName: this.structureName,
      parentId: target.parentId,
      leftId: target.id,
      nodeType: "text",
      char: char,
    };
    this.context.appendOperation(moveOp);
  }
  private getByPath(path: { parents: number[]; offset: number | null }): {
    parentId: Clock | null;
    id: Clock | null;
  } {
    let parentId: Clock | null = null;
    for (const offset of path.parents) {
      parentId = this.children.get(parentId)![offset];
    }
    if (path.offset === null) {
      return { parentId, id: null };
    }
    return {
      parentId,
      id: this.children.get(parentId)![path.offset],
    };
  }

  getByParent(id: null | Clock): any {
    let children: any =
      this.children.get(id)?.map((p) => this.getByParent(p)) ?? [];

    let content;
    if (children[0]?.type === "text") {
      content = children.map((o: any) => o.char).join("");
      children = undefined;
    }
    return {
      type: this.value.get(id)?.type,
      char: this.value.get(id)?.char,
      children: children,
      content,
    };
  }
  toJS() {
    return this.getByParent(null);
  }
}
