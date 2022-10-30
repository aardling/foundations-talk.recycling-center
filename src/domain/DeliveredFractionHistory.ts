import { deliveredFraction, delivery } from "./Delivery.ts";
import { ExcemptionCalculator, PriceCalculationRule } from "./PriceCalculationService.ts";

export class CurrentDeliveryForCalculation {
  private readonly _allDeliveredFractions: delivery[] = [];

  constructor(allDeliveries: delivery[]) {
    this._allDeliveredFractions = allDeliveries;
  }

  calculate(city: string, excemptionRules: { [key: string]: ExcemptionCalculator }, priceRules: { [key: string]: PriceCalculationRule }) {
    return this.allFractionTypes.reduce(
      (price, type) => {
        const weight = excemptionRules[type]!.calculate(
          type,
          city,
          this.deliveredFractionsFor(type),
        );
        return price +
          priceRules[type]!.calculate(weight);
      },
      0,
    );
  }

  private get allFractionTypes() {
    return this.currentDelivery.deliveredFractions.map(
      ({ type }) => type,
    );
  }
  private deliveredFractionsFor(searchType: string): deliveredFraction[] {
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
