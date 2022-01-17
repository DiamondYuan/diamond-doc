import { BasicOperation } from "..";
import { Clock } from "../clock";

export function binarySearchOperation(arr: BasicOperation[], target: Clock) {
  if (arr.length < 1) return -1;
  let lowIndex = 0;
  let highIndex = arr.length - 1;
  while (lowIndex <= highIndex) {
    const midIndex = Math.floor((lowIndex + highIndex) / 2);
    if (target < Clock.decode(arr[midIndex].id)) {
      highIndex = midIndex - 1;
    } else if (target > Clock.decode(arr[midIndex].id)) {
      lowIndex = midIndex + 1;
    } else {
      return midIndex;
    }
  }
  return -1;
}
