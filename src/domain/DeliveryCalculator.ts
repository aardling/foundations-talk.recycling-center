import { DeliveredFractions } from "./DeliveredFractions.ts";
import { delivery } from "./Delivery.ts";
import { PriceCalculationRules } from "./PriceCalculation.ts";
import { WeightExcemptionRules } from "./WeightExcemption.ts";

export class DeliveryCalculator {
  private readonly _deliveries: delivery[];
  constructor(deliveries: delivery[]) {
    this._deliveries = deliveries;
  }
  calculate(
    priceCalculationRules: PriceCalculationRules,
    weightExcemptionRules: WeightExcemptionRules,
    city: string,
  ) {
    return this.fractionTypesForCurrentDelivery.reduce((price, type) => {
      const weight = weightExcemptionRules[type]!
        .calculate(
          city,
          type,
          this.deliveredFractionsFor(type),
        );
      return price + priceCalculationRules[type]!.calculate(weight);
    }, 0);
  }

  private get fractionTypesForCurrentDelivery() {
    return this.currentDelivery.deliveredFractions.map(({ type }) => type);
  }

  private get currentDelivery() {
    return this._deliveries[this._deliveries.length - 1];
  }

  private deliveredFractionsFor(searchType: string) {
    const x = this._deliveries.flatMap(({ deliveredFractions }) =>
      deliveredFractions
    );
    const deliveredFractions = x.filter(
      ({ type }) => type === searchType,
    );
    return new DeliveredFractions(deliveredFractions);
  }
}
