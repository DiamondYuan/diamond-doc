import { IDiamondDoc, IDiamondDocVersion, Operation } from "../types";

export function getOperationsByVersion(
  doc: IDiamondDoc,
  version: IDiamondDocVersion
): Operation[] {
  return doc.operations.filter((op) => {
    const v = version[op.id[0]] ?? -1;
    if (op.id[1] < v) {
      return true;
    }
    return false;
  });
}
