type weightUnit = "Kg";
export default class Weight {
  private readonly _amount: number;
  constructor(amount: number, _unit: weightUnit) {
    this._amount = amount;
  }

  static sum(all: Weight[]) {
    let totalAmount = all.reduce((sum, current) => sum + current.amount, 0);
    return new Weight(totalAmount, "Kg");
  }

  get amount() {
    return this._amount;
  }

  add(other: Weight) {
    return new Weight(this._amount + other.amount, "Kg");
  }

  subtractWithMinimumOfZero(other: Weight) {
    let new_amount = Math.max(0, this._amount - other.amount);
    return new Weight(new_amount, "Kg");
  }

  biggerThan(other: Weight) {
    return this.amount > other.amount;
  }
}
