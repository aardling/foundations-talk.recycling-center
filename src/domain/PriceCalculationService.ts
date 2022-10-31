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
    const pricePerType: { [key: string]: number } = {
      CONSTRUCTION: 0.1,
      "GREEN WASTE": 0.2,
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
      {}
    );
    return Object.keys(deliveryPerType)
      .map((type) => {
        const price: number = pricePerType[type]!;
        return this.calculateFraction(
          household,
          type,
          deliveryPerType[type],
          price
        );
      })
      .reduce((sum, price) => sum + price, 0);
  }


  calculateFraction(
    household: Household,
    type: string,
    deliveries: deliveredFraction[],
    price: number
  ) {
    let totalWeight = deliveries.reduce<number>(
      (total, { weight }) => total + weight,
      0
    );
    let lastWeight = deliveries[deliveries.length - 1]?.weight || 0;
    let previousWeight = totalWeight - lastWeight;
    if (household.city === "Pineville" && type === "CONSTRUCTION") {
      if (lastWeight == totalWeight) {
        lastWeight = lastWeight - 100;
      } else if (previousWeight > 100) {
        // do nothing
      } else {
        lastWeight = lastWeight - Math.max(100 - previousWeight, 0);
      }
    }
    return this.calculatePrice(price, lastWeight)
  }

  private calculatePrice(price: number, weight: number) {
    return Math.max(weight * price, 0);
  }
}
