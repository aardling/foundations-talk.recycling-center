import VisitorsRepository from "./VisitorsRepository.ts";
import { deliveredFraction } from "./Delivery.ts";
import HouseholdRepository from "./HouseholdRepository.ts";
import Household from "./Household.ts";

export default class PriceCalculationService {
  private readonly householdRepository: HouseholdRepository;
  private readonly visitorRepository: VisitorsRepository;

  constructor(
    visitorRepository: VisitorsRepository,
    householdRepository: HouseholdRepository
  ) {
    this.visitorRepository = visitorRepository;
    this.householdRepository = householdRepository;
  }


  calculate(id: string) {
    const priceRules: {[key: string]: PriceCalculationRule} = {
      CONSTRUCTION: new PriceCalculationRule(0.1),
      "GREEN WASTE": new PriceCalculationRule(0.2)
    }
    const excemptionRules: {[key: string]: ExcemptionRule} = {
      CONSTRUCTION: new ExcemptionRule(),
      "GREEN WASTE": new ExcemptionRule()
    }
    const household = this.householdRepository.findByVisitorId(id)!;
    const deliveredFractionHistory = household.deliveredFractionHistory
    const deliveryPerType = deliveredFractionHistory.deliveriesOfCurrentYearPerType

    return Object.keys(deliveryPerType)
      .map((type) => {
        return this.calculateFraction(
          household,
          type,
          deliveryPerType[type],
          excemptionRules[type]!,
          priceRules[type]!
        );
      })
      .reduce((sum, price) => sum + price, 0);
  }


  calculateFraction(
    household: Household,
    type: string,
    deliveries: deliveredFraction[],
    excemptionRule: ExcemptionRule,
    priceCalculationRule: PriceCalculationRule
  ) {
    const weight = excemptionRule.calculate(type, household.city, deliveries)
    return priceCalculationRule.calculate(weight)
  }
}

class ExcemptionRule {
  calculate(type: string, city: string, deliveries: deliveredFraction[]) {
    let totalWeight = deliveries.reduce<number>(
      (total, { weight }) => total + weight,
      0
    );
    let lastWeight = deliveries[deliveries.length - 1]?.weight || 0;
    let previousWeight = totalWeight - lastWeight;
    if (city === "Pineville" && type === "CONSTRUCTION") {
      if (lastWeight == totalWeight) {
        lastWeight = lastWeight - 100;
      } else if (previousWeight > 100) {
        // do nothing
      } else {
        lastWeight = lastWeight - Math.max(100 - previousWeight, 0);
      }
    }
    return lastWeight

  }
}

class PriceCalculationRule {
  private readonly _price : number;
  constructor(price: number) {
    this._price = price;
  }
  calculate(weight: number) {
    return Math.max(weight * this._price, 0)
  }
}