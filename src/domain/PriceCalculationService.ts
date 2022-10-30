import VisitorsRepository from "./VisitorsRepository.ts";
import { deliveredFraction } from "./Delivery.ts";
import HouseholdRepository from "./HouseholdRepository.ts";
import Household from "./Household.ts";

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
    const priceRules: { [key: string]: PriceCalculationRule } = {
      CONSTRUCTION: new PriceCalculationRule(0.1),
      "GREEN WASTE": new PriceCalculationRule(0.2),
    };
    const excemptionRules: { [key: string]: ExcemptionRule } = {
      CONSTRUCTION: new ExcemptionRule("CONSTRUCTION", "Pineville", 100),
      "GREEN WASTE": new ExcemptionRule("GREEN WASTE", "", 0),
    };
    const household = this.householdRepository.findByVisitorId(id)!;
    const deliveredFractionHistory = household.deliveredFractionHistory;
    const deliveryPerType =
      deliveredFractionHistory.deliveriesOfCurrentYearPerType;

    return Object.keys(deliveryPerType)
      .map((type) => {
        return this.calculateFraction(
          household,
          type,
          deliveryPerType[type],
          excemptionRules[type]!,
          priceRules[type]!,
        );
      })
      .reduce((sum, price) => sum + price, 0);
  }

  calculateFraction(
    household: Household,
    type: string,
    deliveries: deliveredFraction[],
    excemptionRule: ExcemptionRule,
    priceCalculationRule: PriceCalculationRule,
  ) {
    const weight = excemptionRule.calculate(type, household.city, deliveries);
    return priceCalculationRule.calculate(weight);
  }
}

class ExcemptionRule {
  private readonly _type: string;
  private readonly _city: string;
  private readonly _excemptionAmount: number;
  constructor(type: string, city: string, excemptionAmount: number) {
    this._type = type;
    this._city = city;
    this._excemptionAmount = excemptionAmount;
  }
  calculate(type: string, city: string, deliveries: deliveredFraction[]) {
    const totalWeight = deliveries.reduce<number>(
      (total, { weight }) => total + weight,
      0,
    );
    let lastWeight = deliveries[deliveries.length - 1]?.weight || 0;
    const previousWeight = totalWeight - lastWeight;
    if (city === this._city && type === this._type) {
      if (lastWeight == totalWeight) {
        lastWeight = lastWeight - this._excemptionAmount;
      } else if (previousWeight > this._excemptionAmount) {
        // do nothing
      } else {
        lastWeight = lastWeight -
          Math.max(this._excemptionAmount - previousWeight, 0);
      }
    }
    return lastWeight;
  }
}

class PriceCalculationRule {
  private readonly _price: number;
  constructor(price: number) {
    this._price = price;
  }
  calculate(weight: number) {
    return Math.max(weight * this._price, 0);
  }
}
