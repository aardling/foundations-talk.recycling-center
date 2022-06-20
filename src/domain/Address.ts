export default class Address {
  private readonly streetAndNumber: string;
  private readonly _city: string;

  constructor(streetAndNumber: string, city: string) {
    this.streetAndNumber = streetAndNumber;
    this._city = city;
  }

  get city() {
    return this._city;
  }

  get id() {
    return `${this.streetAndNumber} ${this._city}`;
  }

  isSame(other: Address) {
    return this.id === other.id;
  }
}
