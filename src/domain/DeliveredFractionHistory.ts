import { deliveredFraction, delivery } from "./Delivery.ts";

export class CurrentDeliveryForCalculation {
  private readonly _allDeliveredFractions: delivery[] = [];

  constructor(allDeliveries: delivery[]) {
    this._allDeliveredFractions = allDeliveries;
  }

  get allFractionTypes() {
    return this.currentDelivery.deliveredFractions.map(
      ({ type }) => type,
    );
  }
  deliveredFractionsFor(searchType: string): deliveredFraction[] {
    return this.deliveriesOfCurrentYear.flatMap(({deliveredFractions}) => deliveredFractions).filter(({type}) => type === searchType)
  }

  private get currentDelivery() {
    return this._allDeliveredFractions[this._allDeliveredFractions.length - 1];
  }
  private get deliveriesOfCurrentYear() {
    return this._allDeliveredFractions.filter(({ deliveryDate }) =>
      deliveryDate.inCalendarYear("2022")
    );
  }
}

export default class DeliveredFractionHistory {
  private readonly _allDeliveredFractions: delivery[] = [];

  constructor(allDeliveries: delivery[]) {
    this._allDeliveredFractions = allDeliveries;
  }

  get deliveriesOfCurrentYear() {
    return this._allDeliveredFractions.filter(({ deliveryDate }) =>
      deliveryDate.inCalendarYear("2022")
    );
  }

  get deliveriesOfCurrentYearPerType() {
    const lastDeliveredFractionTypes = this.lastDelivery.deliveredFractions.map(
      ({ type }) => type,
    );

    return this.deliveriesOfCurrentYear.reduce(
      (perType: { [key: string]: deliveredFraction[] }, delivery) => {
        delivery.deliveredFractions.forEach((delivery) => {
          if (lastDeliveredFractionTypes.includes(delivery.type)) {
            if (!perType[delivery.type]) {
              perType[delivery.type] = [];
            }
            perType[delivery.type].push(delivery);
          }
        });
        return perType;
      },
      {},
    );
  }

  private get lastDelivery() {
    return this._allDeliveredFractions[this._allDeliveredFractions.length - 1];
  }
}
