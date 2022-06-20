import HouseholdRepository from "./HouseholdRepository.ts";
import Inhabitant from "./Inhabitant.ts";
import CalculationRules from "./CalculationRules.ts";
import { Price } from "./Price.ts";
import Household from "./Household.ts";
import { deliveredFraction } from "./Delivery.ts";

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
      .map((deliveredFraction) =>
        this.calculateForFraction(household, deliveredFraction)
      );

    return Price.total(allPrices);
  }

  private calculateForFraction(
    household: Household,
    deliveredFraction: deliveredFraction
  ) {
    let fractionWithoutExemption = this.calculationRules
      .findExemptionRule(household.city, deliveredFraction.type)
      .calculate(household, deliveredFraction);
    return this.calculationRules
      .findCalculationRule(household.city, fractionWithoutExemption.type)
      .calculate(fractionWithoutExemption);
  }
}
