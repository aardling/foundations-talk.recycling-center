import { fractionType, deliveredFraction } from "./Delivery.ts";
import Household from "./Household.ts";
import { Price } from "./Price.ts";
import Weight from "./Weight.ts";

export class NoExemptionRule {
  calculate(
    household: Household,
    deliveredFraction: deliveredFraction
  ): deliveredFraction {
    return deliveredFraction;
  }
}

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
    const allPreviousFractions = household.pastFractions(
      deliveredFraction.type
    );
    const pastWeight = Weight.sum(
      allPreviousFractions.map(({ weight }) => weight)
    );
    if (
      household.city === this._city &&
      this.exemption.biggerThan(pastWeight)
    ) {
      const remainingExemption =
        this.exemption.subtractWithMinimumOfZero(pastWeight);
      return {
        type: deliveredFraction.type,
        weight:
          deliveredFraction.weight.subtractWithMinimumOfZero(
            remainingExemption
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

export class PriceCalculationRule {
  private readonly _fractionType: string;
  private readonly price: Price;
  constructor(fractionType: fractionType, price: Price) {
    this._fractionType = fractionType;
    this.price = price;
  }

  calculate(deliveredFraction: deliveredFraction): Price {
    return this.price.multipleByWeight(deliveredFraction.weight);
  }

  get fractionType() {
    return this._fractionType;
  }
}

export default interface CalculationRules {
  addExemptionRule(exemptionRule: ExemptionRule): void;
  addPriceCalculationRule(priceCalculationRule: PriceCalculationRule): void;
  findExemptionRule(city: string, fractionType: fractionType): ExemptionRule;
  findCalculationRule(
    city: string,
    fractionType: fractionType
  ): PriceCalculationRule;
}
