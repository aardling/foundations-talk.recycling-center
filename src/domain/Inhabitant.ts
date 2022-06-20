import Address from "./Address.ts";

export default class Inhabitant {
  private readonly _id: string;
  private readonly _address: Address;

  constructor(id: string, address: Address) {
    this._id = id;
    this._address = address;
  }

  get id() {
    return this._id;
  }

  livesOn(_address: Address) {
    return this._address.isSame(_address);
  }
}
