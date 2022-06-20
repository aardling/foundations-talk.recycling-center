import Weight from "./Weight.ts";

type currency = "EUR";
export class Price {
  private readonly _amount: number;

  constructor(amount: number, currency: currency) {
    this._amount = amount;
  }

  static total(all: Price[]) {
    const newAmount = all.reduce((sum, price) => sum + price._amount, 0);
    return new Price(newAmount, "EUR");
  }

  get amount() {
    return this._amount;
  }

  multipleByWeight(weight: Weight): Price {
    return new Price(this._amount * weight.amount, "EUR");
  }
}
