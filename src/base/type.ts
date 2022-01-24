import { DiamondDocValueType } from "./../types";
type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};
type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

export type SubType<Base, Condition> = Pick<
  Base,
  AllowedNames<Base, Condition>
>;

export type SubTypeKeys<Base, Condition> = keyof SubType<Base, Condition>;

export type SchemaType<T> = {
  [P in keyof T]: DiamondDocValueType;
} & object;

export type PartialSchemaType<T> = {
  [P in keyof T]?: DiamondDocValueType;
} & object;
