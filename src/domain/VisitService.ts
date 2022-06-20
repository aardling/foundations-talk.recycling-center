import { deliveredFraction } from "./Delivery.ts";
import DeliveryDate from "./DeliveryDate.ts";
import VisitorsRepository from "./VisitorsRepository.ts";
import HouseholdRepository from "./HouseholdRepository.ts";
import Address from "./Address.ts";

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
    const household = this.householdRepository.findByVisitor(visitor!);
    // we ignore that the id might  be invalid
    household.addDelivery(deliveries, deliveryDate);
    this.householdRepository.save(household);
  }

  registerDeliveryForHousehold(
    address: Address,
    deliveries: deliveredFraction[],
    deliveryDate: DeliveryDate
  ) {
    const houseHold = this.householdRepository.findByAddress(address);
    // we ignore that the id might  be invalid
    houseHold.addDelivery(deliveries, deliveryDate);
    this.householdRepository.save(houseHold);
  }
}
