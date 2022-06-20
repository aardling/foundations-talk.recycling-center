import Address from "./Address.ts";
import { deliveredFraction, delivery } from "./Delivery.ts";
import DeliveryDate from "./DeliveryDate.ts";
import Inhabitant from "./Inhabitant.ts";

export default class Household {
  private readonly _address: Address;
  private readonly _inhabitants: Inhabitant[] = [];
  private readonly _deliveries: delivery[] = [];

  constructor(address: Address) {
    this._address = address;
  }
  addInhabitant(inhabitant: Inhabitant) {
    if (inhabitant.livesOn(this._address)) {
      this._inhabitants.push(inhabitant);
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

  allFractionsOfCurrentDelivery(): deliveredFraction[] {
    let currentYear = this.deliveriesOfCurrentYear;
    return currentYear[currentYear.length - 1].deliveredFractions;
  }
}
