import { Clock } from "./../clock";
import { Operation } from "./../types";

export function mergeAndSortOperations(
  local: Operation[],
  remote: Operation[]
): Operation[] {
  const set = new Set();
  const result: Operation[] = [];
  function addIfNotExist(op: Operation) {
    if (!set.has(Clock.decode(op.id).toString())) {
      result.push(op);
      set.add(Clock.decode(op.id).toString());
    }
  }
  local.forEach((p) => addIfNotExist(p));
  remote.forEach((p) => addIfNotExist(p));
  return result.sort((a, b) => {
    return Clock.compare(a.id, b.id);
  });
}
