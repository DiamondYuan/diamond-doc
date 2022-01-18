import { StructureOperation } from "src";
import { getOrInit } from "../base/map";

type Callback = (
  structureCtorId: string,
  structureName: string,
  ops: StructureOperation[]
) => void;

export function groupByCtorAndName(
  ops: StructureOperation[],
  callback: Callback
) {
  const temp: Map<string, Map<string, StructureOperation[]>> = new Map();
  for (const op of ops) {
    getOrInit<StructureOperation[]>(
      temp,
      op.structureCtorId,
      op.structureName,
      () => []
    ).push(op);
  }
  for (const [structureCtorId, map] of temp) {
    for (const [structureName, ops] of map) {
      callback(structureCtorId, structureName, ops);
    }
  }
}
