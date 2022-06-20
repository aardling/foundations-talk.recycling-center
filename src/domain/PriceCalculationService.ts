import HouseholdRepository from "./HouseholdRepository.ts";
import Inhabitant from "./Inhabitant.ts";
import CalculationRules from "./CalculationRules.ts";

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
    const pricePerType: { [key: string]: number } = {
      CONSTRUCTION: 0.1,
      "GREEN WASTE": 0.2,
    };
    const household = this.householdRepository.findByInhabitant(inhabitant);

    let allFractions = household
      .allFractionsOfCurrentDelivery()
      .map((deliveredFraction) => {
        let rule = this.calculationRules.findExemptionRule(
          household.city,
          deliveredFraction.type
        );
        if (rule) {
          return rule.calculate(household, deliveredFraction);
        }
        return deliveredFraction;
      });

    return allFractions.reduce((sum, fraction) => {
      return sum + pricePerType[fraction.type] * fraction.weight.amount;
    }, 0);
  }
}
