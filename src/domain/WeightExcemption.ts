import { DeliveredFractions } from "./DeliveredFractions.ts";

export type WeightExcemptionRules = { [key: string]: WeightExcemption };

export interface WeightExcemption {
  calculate(
    city: string,
    type: string,
    deliveries: DeliveredFractions,
  ): number;
}

export class NoWeightExcemption implements WeightExcemption {
  calculate(
    _city: string,
    _type: string,
    deliveries: DeliveredFractions,
  ) {
    return deliveries.lastWeight;
  }
}

export class WeightExcemptionPerFractionAndCity implements WeightExcemption {
  private readonly _city: string;
  private readonly _type: string;
  private readonly _excemption: number;

  constructor(city: string, type: string, excemption: number) {
    this._city = city;
    this._type = type;
    this._excemption = excemption;
  }

  calculate(
    city: string,
    type: string,
    deliveries: DeliveredFractions,
  ) {
    let lastWeight = deliveries.lastWeight;
    const totalWeight = deliveries.totalWeight;
    const previousWeight = deliveries.previousWeight;
    if (city === this._city && type === this._type) {
      if (lastWeight == totalWeight) {
        lastWeight = lastWeight - this._excemption;
      } else if (previousWeight > this._excemption) {
        // do nothing
      } else {
        lastWeight = lastWeight -
          Math.max(this._excemption - previousWeight, 0);
      }
    }
    return lastWeight;
  }
}
