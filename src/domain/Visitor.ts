import DeliveryDate from "./DeliveryDate.ts";
import Address from "./Address.ts";
import { deliveredFraction, delivery } from "./Delivery.ts";

export default class Visitor {
  private _deliveries: delivery[] = [];
  private readonly _id: string;
  private readonly _address: Address;

  constructor(id: string, address: Address) {
    this._id = id;
    this._address = address;
  }
  addDelivery(
    deliveredFractions: deliveredFraction[],
    deliveryDate: DeliveryDate
  ) {
    this._deliveries.push({ deliveryDate, deliveredFractions });
  }

  get id() {
    return this._id;
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
