import { deliveredFraction } from "./Delivery.ts";

export class DeliveredFractions {
  private readonly _deliveries: deliveredFraction[];
  constructor(deliveries: deliveredFraction[]) {
    this._deliveries = deliveries;
  }
  get lastWeight() {
    return this._deliveries[this._deliveries.length - 1]?.weight || 0;
  }
  get totalWeight() {
    return this._deliveries.reduce<number>(
      (total, { weight }) => total + weight,
      0,
    );
  }
  get previousWeight() {
    return this.totalWeight - this.lastWeight;
  }
}
