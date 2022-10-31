import VisitorsRepository from "./VisitorsRepository.ts";
import { deliveredFraction } from "./Delivery.ts";
import HouseholdRepository from "./HouseholdRepository.ts";

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
    const priceCalculationRules: { [key: string]: PriceCalculation } = {
      CONSTRUCTION: new PriceCalculation(0.1),
      "GREEN WASTE": new PriceCalculation(0.2),
    };
    const household = this.householdRepository.findByVisitorId(id)!;
    const deliveries = household.deliveriesOfCurrentYear;
    const deliveryPerType = deliveries.reduce(
      (perType: { [key: string]: deliveredFraction[] }, delivery) => {
        delivery.deliveredFractions.forEach((delivery) => {
          if (!perType[delivery.type]) {
            perType[delivery.type] = [];
          }
          perType[delivery.type].push(delivery);
        });
        return perType;
      },
      {},
    );
    return Object.keys(deliveryPerType)
      .map((type) => {
        const weight = new WeightExcemption("Pineville", "CONSTRUCTION", 100)
          .calculate(
            household.city,
            type,
            deliveryPerType[type],
          );
        return priceCalculationRules[type]!.calculate(weight);
      })
      .reduce((sum, price) => sum + price, 0);
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

class WeightExcemption {
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
    deliveries: deliveredFraction[],
  ) {
    const totalWeight = deliveries.reduce<number>(
      (total, { weight }) => total + weight,
      0,
    );
    let lastWeight = deliveries[deliveries.length - 1]?.weight || 0;
    const previousWeight = totalWeight - lastWeight;
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
