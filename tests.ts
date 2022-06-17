import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";

type delivery = {
  weight: number;
  type: string;
};

class Visitor {
  private _deliveries: delivery[] = [];
  private readonly _id: string;
  constructor(id: string) {
    this._id = id;
  }
  addDelivery(deliveries: delivery[]) {
    this._deliveries = this._deliveries.concat(deliveries);
  }

  get id() {
    return this._id;
  }

  get deliveries() {
    return this._deliveries;
  }
}

interface VisitorsRepository {
  save(visitor: Visitor): void;
  findById(id: string): Visitor | null;
}

class VisitService {
  private readonly visitorRepository;
  constructor(visitorRepository: VisitorsRepository) {
    this.visitorRepository = visitorRepository;
  }
  registerDelivery(id: string, deliveries: delivery[]) {
    const visitor = this.visitorRepository.findById(id);
    // we ignore that the id might  be invalid
    visitor!.addDelivery(deliveries);
    this.visitorRepository.save(visitor!);
  }
}

class PriceCalculationService {
  private readonly visitorRepository;
  constructor(visitorRepository: VisitorsRepository) {
    this.visitorRepository = visitorRepository;
  }
  calculate(id: string) {
    const visitor = this.visitorRepository.findById(id);
    const deliveries = visitor!.deliveries;
    return deliveries.reduce((price, delivery) => {
      return price + (delivery.weight * 0.1);
    }, 0);
  }
}

class InMemVisitorsRepository implements VisitorsRepository {
  private visitors: { [key: string]: Visitor } = {};
  save(visitor: Visitor): void {
    this.visitors[visitor.id] = visitor;
  }
  findById(id: string): Visitor | null {
    return this.visitors[id];
  }
}

Deno.test("calculate price example 1", () => {
  // PREP
  const visitorRepository = new InMemVisitorsRepository();
  const visitService = new VisitService(visitorRepository);
  const priceCalculationService = new PriceCalculationService(
    visitorRepository,
  );
  const visitorId = "1";
  const visitor = new Visitor(visitorId);
  visitorRepository.save(visitor);

  // GIVEN
  visitService.registerDelivery(visitorId, []);

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 0);
});

Deno.test("calculate price example 2", () => {
  // PREP
  const visitorRepository = new InMemVisitorsRepository();
  const visitService = new VisitService(visitorRepository);
  const priceCalculationService = new PriceCalculationService(
    visitorRepository,
  );
  const visitorId = "1";
  const visitor = new Visitor(visitorId);
  visitorRepository.save(visitor);

  // GIVEN
  visitService.registerDelivery(visitorId, [{
    type: "CONSTRUCTION",
    weight: 200,
  }]);

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 20);
});
