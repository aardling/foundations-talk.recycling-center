import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";

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
  addDelivery(deliveredFractions: deliveredFraction[]) {
    this._deliveries = this._deliveries.concat({
      deliveryDate: new DeliveryDate("TODO"),
      deliveredFractions,
    });
  }
  addDelivery2(
    deliveredFractions: deliveredFraction[],
    deliveryDate: DeliveryDate
  ) {
    this._deliveries.push({ deliveryDate, deliveredFractions });
  }

  get id() {
    return this._id;
  }

  get deliveries() {
    return this._deliveries;
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
  registerDelivery2(
    visitorId: string,
    deliveries: deliveredFraction[],
    deliveryDate: DeliveryDate
  ) {
    const visitor = this.visitorRepository.findById(visitorId);
    // we ignore that the id might  be invalid
    visitor!.addDelivery2(deliveries, deliveryDate);
    this.visitorRepository.save(visitor!);
  }
  private readonly visitorRepository;
  constructor(visitorRepository: VisitorsRepository) {
    this.visitorRepository = visitorRepository;
  }
  registerDelivery(id: string, deliveries: deliveredFraction[]) {
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

Deno.test("calculate price example 1", () => {
  // PREP
  const visitorId = "Kasey";
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    "Moon village"
  );

  // GIVEN
  visitService.registerDelivery(visitorId, []);

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
  visitService.registerDelivery(visitorId, [
    {
      type: "CONSTRUCTION",
      weight: 200,
    },
  ]);

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
  visitService.registerDelivery(visitorId, [
    {
      type: "CONSTRUCTION",
      weight: 200,
    },
  ]);

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
  visitService.registerDelivery(visitorId, [
    {
      type: "CONSTRUCTION",
      weight: 50,
    },
  ]);
  visitService.registerDelivery(visitorId, [
    {
      type: "CONSTRUCTION",
      weight: 25,
    },
  ]);
  visitService.registerDelivery(visitorId, [
    {
      type: "CONSTRUCTION",
      weight: 100,
    },
  ]);

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
  visitService.registerDelivery(visitorId, [
    {
      type: "CONSTRUCTION",
      weight: 50,
    },
  ]);
  visitService.registerDelivery(visitorId, [
    {
      type: "CONSTRUCTION",
      weight: 25,
    },
  ]);
  visitService.registerDelivery(visitorId, [
    {
      type: "CONSTRUCTION",
      weight: 100,
    },
  ]);
  visitService.registerDelivery(visitorId, [
    {
      type: "CONSTRUCTION",
      weight: 100,
    },
  ]);

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
  visitService.registerDelivery(visitorId, [
    {
      type: "CONSTRUCTION",
      weight: 25,
    },
  ]);

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
  visitService.registerDelivery(visitorId, [
    {
      type: "CONSTRUCTION",
      weight: 25,
    },
  ]);
  visitService.registerDelivery(visitorId, [
    {
      type: "GREEN WASTE",
      weight: 100,
    },
  ]);

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 20);
});

// we have 2 new requirements:
// 1. the exemptions are calculated per year, so every calendar year you get the exemptions again
// 2. the exemptions are calculated per household (based on address), so multiple people living together get the exemptions only 1 time

class DeliveryDate {
  private readonly date: string;
  constructor(date: string) {
    this.date = date;
  }
  inCalendarYear(calendarYear: string) {
    return false;
  }
}

Deno.test("calculate price example 8", () => {
  // PREP
  const visitorId = "Aiden";
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    "Pineville"
  );

  // GIVEN
  visitService.registerDelivery2(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 150,
      },
    ],
    new DeliveryDate("2021-10-02")
  );
  visitService.registerDelivery2(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 50,
      },
    ],
    new DeliveryDate("2022-04-07")
  );
  visitService.registerDelivery2(
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
  assertEquals(price, 50);
});
