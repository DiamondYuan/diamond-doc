import { UPDATE } from "../constants";
import { DiamondStructure, DocumentOperation, Operation, StructureOperation } from "../types";

export function isDiamondStructure(data: unknown): data is DiamondStructure {
  if (!data) {
    return false;
  }
  return typeof (data as DiamondStructure)[UPDATE] === "function";
}

export function isStructureOperation(op: Operation): op is StructureOperation {
  return !!op.structureCtorId && !!op.structureName
}

export function isDocumentOperation(op: Operation): op is DocumentOperation {
  return !isStructureOperation(op)
}