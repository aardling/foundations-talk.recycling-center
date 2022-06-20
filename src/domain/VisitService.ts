import { deliveredFraction } from "./Delivery.ts";
import DeliveryDate from "./DeliveryDate.ts";
import HouseholdRepository from "./HouseholdRepository.ts";

export default class VisitService {
  private readonly householdRepository;

  constructor(householdRepository: HouseholdRepository) {
    this.householdRepository = householdRepository;
  }

  registerDelivery(
    inhabitantId: string,
    deliveries: deliveredFraction[],
    deliveryDate: DeliveryDate
  ) {
    const household = this.householdRepository.findByinhabitantId(inhabitantId);
    // we ignore that the id might  be invalid
    household.addDelivery(deliveries, deliveryDate);
    this.householdRepository.save(household);
  }
}
