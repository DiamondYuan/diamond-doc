/* ---------------------------------------------------------------------------------------------
 * MIT License Copyright (c) 2021 Matan Kushner All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * https://github.com/codesandbox/crdt-tree
 *--------------------------------------------------------------------------------------------*/

// copy and modified from https://github.com/codesandbox/crdt-tree/blob/83197aeee9d83f77d5e36bd1ca96dde22b7099ea/src/Clock.ts

export enum Ordering {
  Equal = 0,
  Greater = 1,
  Less = -1,
}

export type EncodedClock = [string, number];

/** Implements a Lamport Clock */
export class Clock {
  actorId: string;
  counter: number;

  constructor(actorId: string, counter: number = 0) {
    this.actorId = actorId;
    this.counter = counter;
  }

  static compare(a: EncodedClock, b: EncodedClock): Ordering {
    return Clock.decode(a).compare(Clock.decode(b));
  }

  static encode(c: Clock): EncodedClock {
    return [c.actorId, c.counter];
  }
  static decode(c: EncodedClock): Clock {
    return new Clock(c[0], c[1]);
  }
  /** Returns a new Clock with same actor but counter incremented by 1 */
  inc(): Clock {
    return new Clock(this.actorId, this.counter + 1);
  }

  /** Increments the clock counter and returns a new Clock */
  tick(): Clock {
    this.counter += 1;
    return new Clock(this.actorId, this.counter);
  }

  /** Returns a new clock with the same actor but the counter is the larger of the two */
  merge(clock: Clock): Clock {
    return new Clock(this.actorId, Math.max(this.counter, clock.counter));
  }

  /** Compare the ordering of the current Clock with another */
  compare(other: Clock): Ordering {
    // Compare Clock's counter with another
    if (this.counter > other.counter) return Ordering.Greater;
    if (this.counter < other.counter) return Ordering.Less;

    // If counters are equal, order is determined based on actorId
    // (this is arbitrary, but deterministic)
    if (this.actorId > other.actorId) return Ordering.Greater;
    if (this.actorId < other.actorId) return Ordering.Less;
    return Ordering.Equal;
  }

  /**
   * Used to retreive a value's primitive, used in comparisons
   * @example
   * const clock1 = new Clock('a');
   * const clock2 = new Clock('b');
   * clock1.tick();
   *
   * // returns true
   * console.log(clock1 > clock2);
   */
  valueOf(): string {
    return this.toString();
  }

  /** Stringify the current clock into a comparable string */
  toString(): string {
    const paddedCounter = String(this.counter).padStart(10, "0");
    return `${paddedCounter}:${this.actorId}`;
  }

  encode(): EncodedClock {
    return Clock.encode(this);
  }
}
