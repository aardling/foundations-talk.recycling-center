import VisitorsRepository from "./VisitorsRepository.ts";
import { deliveredFraction, delivery } from "./Delivery.ts";
import HouseholdRepository from "./HouseholdRepository.ts";

type PriceCalculationRules = { [key: string]: PriceCalculation };
type WeightExcemptionRules = { [key: string]: WeightExcemption };

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

class DeliveryCalculator {
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

class DeliveredFractions {
  private readonly _deliveries: deliveredFraction[];
  constructor(deliveries: deliveredFraction[]) {
    this._deliveries = deliveries;
  }
  get lastWeight() {
    return this._deliveries[this._deliveries.length - 1]?.weight || 0;
  }
  get totalWeight() {
    return this._deliveries.reduce<number>(
      (total, { weight }) => total + weight,
      0,
    );
  }
  get previousWeight() {
    return this.totalWeight - this.lastWeight;
  }
}

class PriceCalculation {
  private _price: number;
  constructor(price: number) {
    this._price = price;
  }
  calculate(weight: number) {
    return Math.max(weight * this._price, 0);
  }
}

interface WeightExcemption {
  calculate(
    city: string,
    type: string,
    deliveries: DeliveredFractions,
  ): number;
}

class NoWeightExcemption implements WeightExcemption {
  calculate(
    _city: string,
    _type: string,
    deliveries: DeliveredFractions,
  ) {
    return deliveries.lastWeight;
  }
}

class WeightExcemptionPerFractionAndCity implements WeightExcemption {
  private readonly _city: string;
  private readonly _type: string;
  private readonly _excemption: number;

  constructor(city: string, type: string, excemption: number) {
    this._city = city;
    this._type = type;
    this._excemption = excemption;
  }

  calculate(
    city: string,
    type: string,
    deliveries: DeliveredFractions,
  ) {
    let lastWeight = deliveries.lastWeight;
    const totalWeight = deliveries.totalWeight;
    const previousWeight = deliveries.previousWeight;
    if (city === this._city && type === this._type) {
      if (lastWeight == totalWeight) {
        lastWeight = lastWeight - this._excemption;
      } else if (previousWeight > this._excemption) {
        // do nothing
      } else {
        lastWeight = lastWeight -
          Math.max(this._excemption - previousWeight, 0);
      }
    }
    return lastWeight;
  }
}
