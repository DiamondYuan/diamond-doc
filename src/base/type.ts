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
  readonly [P in keyof T]: DiamondDocValueType;
} & object;

// function test<T extends SchemaType<T> = {}>(): T {
//   return {} as any as T;
// }

// const a = test();

// type a = Readonly<{ a: number }>;
