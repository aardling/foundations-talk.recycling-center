import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";
import DeliveryDate from "./src/domain/DeliveryDate.ts";

type deliveredFraction = {
  weight: number;
  type: string;
};

type delivery = {
  deliveryDate: DeliveryDate;
  deliveredFractions: deliveredFraction[];
};

class Visitor {
  private _deliveries: delivery[] = [];
  private readonly _id: string;
  private readonly _city: string;

  constructor(id: string, city: string) {
    this._id = id;
    this._city = city;
  }
  addDelivery(
    deliveredFractions: deliveredFraction[],
    deliveryDate: DeliveryDate
  ) {
    this._deliveries.push({ deliveryDate, deliveredFractions });
  }

  get id() {
    return this._id;
  }

  get deliveries() {
    return this._deliveries.filter(({deliveryDate}) => deliveryDate.inCalendarYear("2022"));
  }

  get city() {
    return this._city;
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

class PriceCalculationService {
  private readonly visitorRepository;
  constructor(visitorRepository: VisitorsRepository) {
    this.visitorRepository = visitorRepository;
  }
  calculateFraction(
    visitor: Visitor,
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
    if (visitor.city === "Pineville" && type === "CONSTRUCTION") {
      if (lastWeight == totalWeight) {
        lastWeight = lastWeight - 100;
      } else if (previousWeight > 100) {
        // do nothing
      } else {
        lastWeight = lastWeight - Math.max(100 - previousWeight, 0);
      }
    }
    return Math.max(lastWeight * price, 0);
  }
  calculate(id: string) {
    const visitor = this.visitorRepository.findById(id)!;
    const deliveries = visitor!.deliveries;
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
    const pricePerType: { [key: string]: number } = {
      CONSTRUCTION: 0.1,
      "GREEN WASTE": 0.2,
    };
    return Object.keys(deliveryPerType)
      .map((type) => {
        const price: number = pricePerType[type]!;
        return this.calculateFraction(
          visitor,
          type,
          deliveryPerType[type],
          price
        );
      })
      .reduce((sum, price) => sum + price, 0);
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

function testSetup(visitorId: string, city: string) {
  const visitorRepository = new InMemVisitorsRepository();
  const visitService = new VisitService(visitorRepository);
  const priceCalculationService = new PriceCalculationService(
    visitorRepository
  );
  const visitor = new Visitor(visitorId, city);
  visitorRepository.save(visitor);
  return { visitService, priceCalculationService };
}

const deliveryDate = new DeliveryDate("2022-06-20");

Deno.test("calculate price example 1", () => {
  // PREP
  const visitorId = "Kasey";
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    "Moon village"
  );

  // GIVEN
  visitService.registerDelivery(visitorId, [], deliveryDate);

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 0);
});

Deno.test("calculate price example 2", () => {
  // PREP
  const visitorId = "Kasey";
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    "Moon village"
  );

  // GIVEN
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 200,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 20);
});

Deno.test("calculate price example 3", () => {
  // PREP
  const visitorId = "Aiden";
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    "Pineville"
  );

  // GIVEN
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 200,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 10);
});

Deno.test("calculate price example 4", () => {
  // PREP
  const visitorId = "Aiden";
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    "Pineville"
  );

  // GIVEN
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 50,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 25,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 100,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 7.5);
});

Deno.test("calculate price example 5", () => {
  // PREP
  const visitorId = "Aiden";
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    "Pineville"
  );

  // GIVEN
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 50,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 25,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 100,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 100,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 10);
});

Deno.test("calculate price example 6", () => {
  // PREP
  const visitorId = "Aiden";
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    "Pineville"
  );

  // GIVEN
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 25,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 0);
});

Deno.test("calculate price example 7", () => {
  // PREP
  const visitorId = "Aiden";
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    "Pineville"
  );

  // GIVEN
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 25,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "GREEN WASTE",
        weight: 100,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 20);
});

Deno.test("calculate price example 8", () => {
  // PREP
  const visitorId = "Aiden";
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    "Pineville"
  );

  // GIVEN
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 150,
      },
    ],
    new DeliveryDate("2021-10-02")
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 50,
      },
    ],
    new DeliveryDate("2022-04-07")
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 100,
      },
    ],
    new DeliveryDate("2022-06-22")
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 5);
});
