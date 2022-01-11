import { isDiamondStructure } from "../../src/utils/is-diamond-structure";
import { TestDoc } from "../fixture/test-doc";

it("test isDiamondStructure", () => {
  const doc = new TestDoc();
  ["", null, undefined, doc].forEach((e) => {
    expect(isDiamondStructure(e)).toBeFalsy();
  });
});
