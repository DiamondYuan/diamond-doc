import { Operation } from "./../types";

export function mergeAndSortOperations(
  local: Operation[],
  remote: Operation[]
): Operation[] {
  const set = new Set();
  const result: Operation[] = [];
  function addIfNotExist(op: Operation) {
    if (!set.has(op.id.toString())) {
      result.push(op);
      set.add(op.id.toString());
    }
  }
  local.forEach((p) => addIfNotExist(p));
  remote.forEach((p) => addIfNotExist(p));
  return result.sort((a, b) => {
    if (a.id > b.id) {
      return 1;
    } else if (a.id < b.id) {
      return -1;
    }
    /* istanbul ignore next */
    throw new Error("fatal error.");
  });
}
