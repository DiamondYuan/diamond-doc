import { DiamondDocDataType } from "../../src";
import {
  getValueDescription,
  getValue,
} from "../../src/utils/value-description";

it("test", () => {
  const data = [null, 1, "2", 3.3, true, false];

  const valueDescription = data.map((value) => getValueDescription(value));
  expect(valueDescription).toEqual([
    { type: DiamondDocDataType.null },
    { type: DiamondDocDataType.int, value: "1" },
    { type: DiamondDocDataType.string, value: "2" },
    { type: DiamondDocDataType.float64, value: "3.3" },
    { type: DiamondDocDataType.boolean, value: true },
    { type: DiamondDocDataType.boolean, value: false },
  ]);

  expect(
    valueDescription.map((o) =>
      getValue(o, () => {
        throw new Error("not implements");
      })
    )
  ).toEqual(data);
});
