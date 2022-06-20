import { deliveredFraction } from "./Delivery.ts";
import DeliveryDate from "./DeliveryDate.ts";
import VisitorsRepository from "./VisitorsRepository.ts";

export default class VisitService {
  private readonly visitorRepository;
  constructor(visitorRepository: VisitorsRepository) {
    this.visitorRepository = visitorRepository;
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
}
