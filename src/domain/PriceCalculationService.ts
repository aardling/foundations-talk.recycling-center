import HouseholdRepository from "./HouseholdRepository.ts";
import Inhabitant from "./Inhabitant.ts";
import CalculationRules from "./CalculationRules.ts";
import { Price } from "./Price.ts";

export default class PriceCalculationService {
  private readonly householdRepository: HouseholdRepository;
  private readonly calculationRules: CalculationRules;
  constructor(
    householdRepository: HouseholdRepository,
    calculationRules: CalculationRules
  ) {
    this.householdRepository = householdRepository;
    this.calculationRules = calculationRules;
  }

  calculate(inhabitant: Inhabitant) {
    const household = this.householdRepository.findByInhabitant(inhabitant);

    let allPrices = household
      .allFractionsOfCurrentDelivery()
      .map((deliveredFraction) => {
        return this.calculationRules
          .findExemptionRule(household.city, deliveredFraction.type)
          .calculate(household, deliveredFraction);
      })
      .map((fractionToPayFor) => {
        return this.calculationRules
          .findCalculationRule(household.city, fractionToPayFor.type)
          .calculate(fractionToPayFor);
      });

    return Price.total(allPrices);
  }
}
