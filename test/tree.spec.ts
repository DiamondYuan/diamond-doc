import { DiamondDoc } from "../src/index";
import { DiamondTree } from "../src/structure/Tree";

it("test DiamondArray", () => {
  const remote = new DiamondDoc([], [DiamondTree]);
  const remoteArray = remote.get(DiamondTree, "tree");

  remoteArray.addNode([], null, "h1");
  remoteArray.addNode([0], null, "p");
  remoteArray.addText([0, 0], null, "H");
  remoteArray.addText([0, 0], 0, "e");
  remoteArray.addText([0, 0], 1, "l");
  remoteArray.addText([0, 0], 2, "l");
  remoteArray.addText([0, 0], 3, "0");

  const local = new DiamondDoc([], [DiamondTree]);
  const localArray = local.get(DiamondTree, "tree");
  local.merge(remote);
  console.log(JSON.stringify(localArray.toJS(), null, 2));

  //   remoteArray.addNode([], 0, "h2");
  //   remoteArray.move([0], 0, [1], null);

  console.log(JSON.stringify(remoteArray.toJS(), null, 2));
});
