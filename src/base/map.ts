export function getOrInit<T>(
  map: Map<string, Map<string, unknown>>,
  first: string,
  second: string,
  init: (first: string, second: string) => unknown
): T {
  const firstMap = map.get(first) || new Map<string, unknown>();
  map.set(first, firstMap);
  let value = firstMap.get(second) as T | undefined;
  if (!value) {
    value = init(first, second) as T;
  }
  firstMap.set(second, value);
  return firstMap.get(second) as T;
}
