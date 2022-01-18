# DiamondDoc

> This code is currently a work in progress. Do not use it in production.

DiamondDoc will **not** follow semver before 1.0。

DiamondDoc is an State-based CRDT Types (CvCRDT). Zero dependent.

```ts
import { DiamondDoc, DiamondArray } from "diamond-doc";

const local = new DiamondDoc([], [DiamondArray]);
const remote = new DiamondDoc([], [DiamondArray]);

const array = local.get<DiamondArray<string>>(DiamondArray, "data");

array.push("Hello");
array.push("World");

const remoteArray = remote.get(DiamondArray, "data");
remote.merge(local);

console.log(remoteArray.toJS()); // [ 'Hello', 'World' ]
```

## Why not

### Yjs

1.  Yjs does not support extending new data structures. For example, a movable tree.

## LICENSE

This code is published under the MIT license.
