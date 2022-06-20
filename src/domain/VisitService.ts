import { deliveredFraction } from "./Delivery.ts";
import DeliveryDate from "./DeliveryDate.ts";
import VisitorsRepository from "./VisitorsRepository.ts";
import HouseholdRepository from "./HouseholdRepository.ts";

export default class VisitService {
  private readonly visitorRepository;
  private readonly householdRepository;

  constructor(
    visitorRepository: VisitorsRepository,
    householdRepository: HouseholdRepository
  ) {
    this.visitorRepository = visitorRepository;
    this.householdRepository = householdRepository;
  }

  registerDelivery(
    visitorId: string,
    deliveries: deliveredFraction[],
    deliveryDate: DeliveryDate
  ) {
    const visitor = this.visitorRepository.findById(visitorId);
    // we ignore that the id might  be invalid
    visitor!.addDelivery(deliveries, deliveryDate);
    this.visitorRepository.save(visitor!);
  }

  registerDeliveryForHousehold(
    visitorId: string,
    deliveries: deliveredFraction[],
    deliveryDate: DeliveryDate
  ) {
    const houseHold = this.householdRepository.findById(visitorId);
    // we ignore that the id might  be invalid
    houseHold.addDelivery(deliveries, deliveryDate);
    this.householdRepository.save(houseHold);
  }
}
