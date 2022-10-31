import HouseholdRepository from "./HouseholdRepository.ts";
import { DeliveryCalculator } from "./DeliveryCalculator.ts";
import { PriceCalculation, PriceCalculationRules } from "./PriceCalculation.ts";
import {
  NoWeightExcemption,
  WeightExcemptionPerFractionAndCity,
  WeightExcemptionRules,
} from "./WeightExcemption.ts";

export default class PriceCalculationService {
  private readonly householdRepository: HouseholdRepository;
  private readonly priceCalculationRules: PriceCalculationRules;
  private readonly weightExcemptionRules: WeightExcemptionRules;

  constructor(
    householdRepository: HouseholdRepository,
  ) {
    this.householdRepository = householdRepository;
    this.priceCalculationRules = {
      CONSTRUCTION: new PriceCalculation(0.1),
      "GREEN WASTE": new PriceCalculation(0.2),
    };
    this.weightExcemptionRules = {
      CONSTRUCTION: new WeightExcemptionPerFractionAndCity(
        "Pineville",
        "CONSTRUCTION",
        100,
      ),
      "GREEN WASTE": new NoWeightExcemption(),
    };
  }

  calculate(id: string) {
    const household = this.householdRepository.findByVisitorId(id)!;
    const deliveries = household.deliveriesOfCurrentYear;
    const deliveryCalculator = new DeliveryCalculator(deliveries);
    return deliveryCalculator.calculate(
      this.priceCalculationRules,
      this.weightExcemptionRules,
      household.city,
    );
  }
}
