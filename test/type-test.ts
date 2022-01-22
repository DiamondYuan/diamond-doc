// MIT License

// Copyright (c) 2018-2021 David Sherret

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

//copy from https://github.com/dsherret/conditional-type-checks/blob/e19ce671a083bda0a65f3657a209a47a487e8665/mod.ts

/**
 * Asserts at compile time that the provided type argument's type resolves to the expected boolean literal type.
 * @param expectTrue - True if the passed in type argument resolved to true.
 */
export function assert<T extends true | false>(expectTrue: T) {}

/**
 * Asserts at compile time that the provided type argument's type resolves to true.
 */
export type AssertTrue<T extends true> = never;

/**
 * Asserts at compile time that the provided type argument's type resolves to false.
 */
export type AssertFalse<T extends false> = never;

/**
 * Asserts at compile time that the provided type argument's type resolves to the expected boolean literal type.
 */
export type Assert<T extends true | false, Expected extends T> = never;

/**
 * Checks if type `T` has the specified type `U`.
 */
export type Has<T, U> = IsAny<T> extends true
  ? true
  : IsAny<U> extends true
  ? false
  : Extract<T, U> extends never
  ? false
  : true;

/**
 * Checks if type `T` does not have the specified type `U`.
 */
export type NotHas<T, U> = Has<T, U> extends false ? true : false;

/**
 * Checks if type `T` is possibly null or undefined.
 */
export type IsNullable<T> = Extract<T, null | undefined> extends never
  ? false
  : true;

/**
 * Checks if type `T` exactly matches type `U`.
 */
export type IsExact<T, U> = TupleMatches<
  AnyToBrand<T>,
  AnyToBrand<U>
> extends true
  ? TupleMatches<
      DeepMakeRequiredForIsExact<T>,
      DeepMakeRequiredForIsExact<U>
    > extends true // catch optional properties
    ? true
    : false
  : false;

type DeepMakeRequiredForIsExact<T> = {
  [P in keyof T]-?: DeepMakeRequiredForIsExact<AnyToBrand<T[P]>>;
};

/**
 * Checks if type `T` is the `any` type.
 */
// https://stackoverflow.com/a/49928360/3406963
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Checks if type `T` is the `never` type.
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * Checks if type `T` is the `unknown` type.
 */
export type IsUnknown<T> = IsNever<T> extends false
  ? T extends unknown
    ? unknown extends T
      ? IsAny<T> extends false
        ? true
        : false
      : false
    : false
  : false;

type TupleMatches<T, U> = Matches<[T], [U]> extends true ? true : false;
type Matches<T, U> = T extends U ? (U extends T ? true : false) : false;

type AnyToBrand<T> = IsAny<T> extends true
  ? { __conditionalTypeChecksAny__: undefined }
  : T;
