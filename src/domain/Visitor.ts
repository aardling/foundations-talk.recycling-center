import Address from "./Address.ts";

export default class Visitor {
  private readonly _id: string;
  private readonly _address: Address;

  constructor(id: string, address: Address) {
    this._id = id;
    this._address = address;
  }

  get id() {
    return this._id;
  }

  get address() {
    return this._address;
  }
}
