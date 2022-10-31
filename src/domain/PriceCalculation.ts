export type PriceCalculationRules = { [key: string]: PriceCalculation };

export class PriceCalculation {
  private _price: number;
  constructor(price: number) {
    this._price = price;
  }
  calculate(weight: number) {
    return Math.max(weight * this._price, 0);
  }
}
