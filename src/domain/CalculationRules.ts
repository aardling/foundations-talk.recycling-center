import { fractionType, deliveredFraction } from "./Delivery.ts";
import Household from "./Household.ts";
import Weight from "./Weight.ts";

export class ExemptionRule {
  private readonly _city: string;
  private readonly _fractionType: string;
  private readonly exemption: Weight;
  constructor(city: string, fractionType: fractionType, exemption: Weight) {
    this._city = city;
    this._fractionType = fractionType;
    this.exemption = exemption;
  }

  calculate(
    household: Household,
    deliveredFraction: deliveredFraction
  ): deliveredFraction {
    if (household.city === this._city) {
      return {
        type: deliveredFraction.type,
        weight: deliveredFraction.weight.subtractWithMinimumOfZero(
          this.exemption
        ),
      };
    }
    return deliveredFraction;
  }

  get city() {
    return this._city;
  }

  get fractionType() {
    return this._fractionType;
  }
}

export default interface CalculationRules {
  addExemptionRule(exemptionRule: ExemptionRule): void;
  findExemptionRule(city: string, fractionType: fractionType): ExemptionRule;
}
