type weightUnit = "Kg";
export default class Weight {
  private readonly _amount: number;
  constructor(amount: number, _unit: weightUnit) {
    this._amount = amount;
  }

  get amount() {
    return this._amount;
  }

  add(other: Weight) {
    return new Weight(this._amount + other.amount, "Kg");
  }
}
