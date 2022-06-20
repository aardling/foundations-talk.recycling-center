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
}
