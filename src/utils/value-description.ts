import {
  DiamondStructure,
  DiamondDocValueType,
  ValueDescription,
  DiamondDocDataType,
} from "../types";
import { isDiamondStructure } from "./is-diamond-structure";

/**
 * inspired from https://github.com/automerge/automerge/blob/aeb90e51a85c7135c24bba8e3645d41befb3a928/frontend/context.js
 *
 * @param value
 * @returns
 */
export function getValueDescription(
  value: DiamondDocValueType
): ValueDescription {
  const valueType = typeof value;
  switch (valueType) {
    case "string": {
      return {
        type: DiamondDocDataType.string,
        value: String(value),
      };
    }
    case "number": {
      const isInt =
        Number.isInteger(value) &&
        (value as number) <= Number.MAX_SAFE_INTEGER &&
        (value as number) >= Number.MIN_SAFE_INTEGER;
      return {
        type: isInt ? DiamondDocDataType.int : DiamondDocDataType.float64,
        value: String(value),
      };
    }
    case "boolean": {
      return {
        type: DiamondDocDataType.boolean,
        value: value as boolean,
      };
    }
    case "object": {
      if (value === null) {
        return { type: DiamondDocDataType.null };
      }
      if (isDiamondStructure(value)) {
        return {
          type: DiamondDocDataType.diamond,
          structureCtorId: value.structureCtorId,
          structureName: value.structureName,
        };
      }
    }
    default: {
      /* istanbul ignore next */
      throw new Error(`Unsupported type of value: ${value}`);
    }
  }
}

type DiamondStructureFactory = (
  structureCtorId: string,
  structureName: string
) => DiamondStructure;

export function getValue(v: ValueDescription, c: DiamondStructureFactory) {
  switch (v.type) {
    case DiamondDocDataType.string:
    case DiamondDocDataType.boolean: {
      return v.value;
    }
    case DiamondDocDataType.int: {
      return parseInt(v.value, 10);
    }
    case DiamondDocDataType.float64: {
      return parseFloat(v.value);
    }
    case DiamondDocDataType.null: {
      return null;
    }
    case DiamondDocDataType.diamond: {
      return c(v.structureCtorId, v.structureName);
    }
  }
}
