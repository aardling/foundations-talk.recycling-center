import VisitorsRepository from "./VisitorsRepository.ts";
import { deliveredFraction } from "./Delivery.ts";
import HouseholdRepository from "./HouseholdRepository.ts";
import Household from "./Household.ts";
import { CurrentDeliveryForCalculation } from "./DeliveredFractionHistory.ts";

export default class PriceCalculationService {
  private readonly householdRepository: HouseholdRepository;
  private readonly visitorRepository: VisitorsRepository;

  constructor(
    visitorRepository: VisitorsRepository,
    householdRepository: HouseholdRepository,
  ) {
    this.visitorRepository = visitorRepository;
    this.householdRepository = householdRepository;
  }

  calculate(id: string) {
    const priceRules = [
      new PriceCalculationRule("CONSTRUCTION", 0.1),
      new PriceCalculationRule("GREEN WASTE", 0.2),
    ];
    const excemptionRules = [
      new ExcemptionRule("CONSTRUCTION", "Pineville", 100),
      new NoExcemptionRule("GREEN WASTE"),
    ];
    const household = this.householdRepository.findByVisitorId(id)!;
    const currentDeliveryForCalculation = new CurrentDeliveryForCalculation(
      household.deliveries,
    );

    return currentDeliveryForCalculation.allFractionTypes.reduce(
      (price, type) => {
        const weight = excemptionRules.reduce((total, rule) => {
          return total +
            rule.calculate(
              type,
              household.city,
              currentDeliveryForCalculation.deliveredFractionsFor(type),
            );
        }, 0);
        return price + priceRules.reduce((total, rule) =>
          total + rule.calculate(type, weight), 0);
      },
      0,
    );
  }

  // calculate2(id: string) {
  //   const priceRules: { [key: string]: PriceCalculationRule } = {
  //     CONSTRUCTION: new PriceCalculationRule(0.1),
  //     "GREEN WASTE": new PriceCalculationRule(0.2),
  //   };
  //   const excemptionRules: { [key: string]: ExcemptionCalculator } = {
  //     CONSTRUCTION: new ExcemptionRule("CONSTRUCTION", "Pineville", 100),
  //     "GREEN WASTE": new NoExcemptionRule(),
  //   };
  //   const household = this.householdRepository.findByVisitorId(id)!;
  //   const deliveredFractionHistory = household.deliveredFractionHistory;
  //   const currentDeliveryForCalculation = new CurrentDeliveryForCalculation(
  //     household.deliveries,
  //   );
  //   const deliveryPerType =
  //     deliveredFractionHistory.deliveriesOfCurrentYearPerType;

  //   return Object.keys(deliveryPerType)
  //     .map((type) => {
  //       return this.calculateFraction(
  //         household,
  //         type,
  //         deliveryPerType[type],
  //         excemptionRules[type]!,
  //         priceRules[type]!,
  //       );
  //     })
  //     .reduce((sum, price) => sum + price, 0);
  // }

  // calculateFraction(
  //   household: Household,
  //   type: string,
  //   deliveries: deliveredFraction[],
  //   excemptionRule: ExcemptionCalculator,
  //   priceCalculationRule: PriceCalculationRule,
  // ) {
  //   const weight = excemptionRule.calculate(type, household.city, deliveries);
  //   return priceCalculationRule.calculate(weight);
  // }
}

interface ExcemptionCalculator {
  calculate(
    type: string,
    city: string,
    deliveries: deliveredFraction[],
  ): number;
}

class ExcemptionRule implements ExcemptionCalculator {
  private readonly _type: string;
  private readonly _city: string;
  private readonly _excemptionAmount: number;
  constructor(type: string, city: string, excemptionAmount: number) {
    this._type = type;
    this._city = city;
    this._excemptionAmount = excemptionAmount;
  }
  calculate(type: string, city: string, deliveries: deliveredFraction[]) {
    if (city !== this._city || type !== this._type) {
        return 0 
    }
    const totalWeight = deliveries.reduce<number>(
      (total, { weight }) => total + weight,
      0,
    );
    let lastWeight = deliveries[deliveries.length - 1]?.weight || 0;
    const previousWeight = totalWeight - lastWeight;
      if (lastWeight == totalWeight) {
        lastWeight = lastWeight - this._excemptionAmount;
      } else if (previousWeight > this._excemptionAmount) {
        // do nothing
      } else {
        lastWeight = lastWeight -
          Math.max(this._excemptionAmount - previousWeight, 0);
      }
    return lastWeight;
  }
}

class NoExcemptionRule implements ExcemptionCalculator {
private _type: string;
  constructor(type: string) {
    this._type = type;
  }
  calculate(type: string, _city: string, deliveries: deliveredFraction[]) {
    if (type !== this._type) {
        return 0 
    }
    const lastWeight = deliveries[deliveries.length - 1]?.weight || 0;
    return lastWeight;
  }
}

class PriceCalculationRule {
  private readonly _price: number;
  private readonly _fraction: string;
  constructor(fraction: string, price: number) {
    this._fraction = fraction;
    this._price = price;
  }
  calculate(type: string, weight: number) {
    if (this._fraction === type) {
      return Math.max(weight * this._price, 0);
    }
    return 0;
  }
}
