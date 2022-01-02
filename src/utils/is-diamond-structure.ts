import { update } from "../types";
import { DiamondStructure } from "../types";

export function isDiamondStructure(data: unknown): data is DiamondStructure {
  if (!data) {
    return false;
  }
  return typeof (data as DiamondStructure)[update] === "function";
}
