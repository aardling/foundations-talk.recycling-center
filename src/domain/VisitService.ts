import { deliveredFraction } from "./Delivery.ts";
import DeliveryDate from "./DeliveryDate.ts";
import HouseholdRepository from "./HouseholdRepository.ts";
import Inhabitant from "./Inhabitant.ts";

export default class VisitService {
  private readonly householdRepository;

  constructor(householdRepository: HouseholdRepository) {
    this.householdRepository = householdRepository;
  }

  registerDelivery(
    inhabitant: Inhabitant,
    deliveries: deliveredFraction[],
    deliveryDate: DeliveryDate
  ) {
    const household = this.householdRepository.findByInhabitant(inhabitant);
    // we ignore that the id might  be invalid
    household.addDelivery(deliveries, deliveryDate);
    this.householdRepository.save(household);
  }
}
