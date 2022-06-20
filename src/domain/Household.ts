import Address from "./Address.ts";
import { deliveredFraction, delivery } from "./Delivery.ts";
import DeliveryDate from "./DeliveryDate.ts";
import Visitor from "./Visitor.ts";

export default class Household {
  private readonly _address: Address;
  private readonly _inhabitants: Visitor[] = [];
  private readonly _deliveries: delivery[] = [];

  constructor(address: Address) {
    this._address = address;
  }
  addInhabitant(visitor: Visitor) {
    if (this._address.isSame(visitor.address)) {
      this._inhabitants.push(visitor);
    } else {
      throw AggregateError(
        "Can only add inhabitants that live on the same address"
      );
    }
  }
  addDelivery(
    deliveredFractions: deliveredFraction[],
    deliveryDate: DeliveryDate
  ) {
    this._deliveries.push({ deliveryDate, deliveredFractions });
  }

  get id() {
    return this._address.id;
  }

  get inhabitants() {
    return this._inhabitants;
  }

  get deliveriesOfCurrentYear() {
    return this._deliveries.filter(({ deliveryDate }) =>
      deliveryDate.inCalendarYear("2022")
    );
  }

  get city() {
    return this._address.city;
  }
}
