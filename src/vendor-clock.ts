import { IDiamondDocVersion } from "./types";
import { Clock, EncodedClock } from "./clock";

export class VendorClock {
  private vendorClock: Map<string, Clock> = new Map();
  constructor() {}

  merge(_clock: EncodedClock) {
    const clock = Clock.decode(_clock);
    if (!this.vendorClock.has(clock.actorId)) {
      this.vendorClock.set(clock.actorId, clock);
      return;
    }
    const c = this.vendorClock.get(clock.actorId)!;
    this.vendorClock.set(clock.actorId, c.merge(clock));
  }

  version(): IDiamondDocVersion {
    const version: IDiamondDocVersion = {};
    for (const [actorId, clock] of this.vendorClock.entries()) {
      version[actorId] = clock.counter;
    }
    return version;
  }
}
