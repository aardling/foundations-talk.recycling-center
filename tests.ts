import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";

import DeliveryDate from "./src/domain/DeliveryDate.ts";
import Address from "./src/domain/Address.ts";
import PriceCalculationService from "./src/domain/PriceCalculationService.ts";
import Visitor from "./src/domain/Visitor.ts";
import VisitService from "./src/domain/VisitService.ts";
import Household from "./src/domain/Household.ts";
import { InMemVisitorsRepository } from "./src/domain/InMemVisitorsRepository.ts";
import { InMemHouseholdRepository } from "./src/domain/InMemHouseholdRepository.ts";

function testSetup(visitorId: string, address: Address) {
  const visitorRepository = new InMemVisitorsRepository();
  const householdRepository = new InMemHouseholdRepository();
  const visitService = new VisitService(visitorRepository, householdRepository);
  const priceCalculationService = new PriceCalculationService(
    visitorRepository,
    householdRepository,
  );
  const visitor = new Visitor(visitorId, address);
  visitorRepository.save(visitor);
  const houseHold = new Household(address);
  houseHold.addInhabitant(visitor);
  householdRepository.save(houseHold);
  return {
    householdRepository,
    visitorRepository,
    visitService,
    priceCalculationService,
  };
}

const deliveryDate = new DeliveryDate("2022-06-20");

const kasey = {
  visitorId: "Kasey",
  address: new Address("Eveningred 31", "Moon village"),
};

const aiden = {
  visitorId: "Aiden",
  address: new Address("Green Street 103", "Pineville"),
};

const john = {
  visitorId: "John",
  address: new Address("Green Street 103", "Pineville"),
};

Deno.test("calculate price example 1", () => {
  // PREP
  const visitorId = kasey.visitorId;
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    kasey.address,
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
  const visitorId = kasey.visitorId;
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    kasey.address,
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
    deliveryDate,
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 20);
});

Deno.test("calculate price example 3", () => {
  // PREP
  const visitorId = aiden.visitorId;
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    aiden.address,
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
    deliveryDate,
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 10);
});

Deno.test("calculate price example 4", () => {
  // PREP
  const visitorId = aiden.visitorId;
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    aiden.address,
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
    deliveryDate,
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 25,
      },
    ],
    deliveryDate,
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 100,
      },
    ],
    deliveryDate,
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 7.5);
});

Deno.test("calculate price example 5", () => {
  // PREP
  const visitorId = aiden.visitorId;
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    aiden.address,
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
    deliveryDate,
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 25,
      },
    ],
    deliveryDate,
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 100,
      },
    ],
    deliveryDate,
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 100,
      },
    ],
    deliveryDate,
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 10);
});

Deno.test("calculate price example 6", () => {
  // PREP
  const visitorId = aiden.visitorId;
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    aiden.address,
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
    deliveryDate,
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 0);
});

Deno.test("calculate price example 7", () => {
  // PREP
  const visitorId = aiden.visitorId;
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    aiden.address,
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
    deliveryDate,
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "GREEN WASTE",
        weight: 100,
      },
    ],
    deliveryDate,
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 20);
});

// we have 2 new requirements:
// 1. the exemptions are calculated per year, so every calendar year you get the exemptions again
// 2. the exemptions are calculated per household (based on address), so multiple people living together get the exemptions only 1 time

Deno.test("calculate price example 8", () => {
  // PREP
  const visitorId = aiden.visitorId;
  const { visitService, priceCalculationService } = testSetup(
    visitorId,
    aiden.address,
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
    new DeliveryDate("2021-10-02"),
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 50,
      },
    ],
    new DeliveryDate("2022-04-07"),
  );
  visitService.registerDelivery(
    visitorId,
    [
      {
        type: "CONSTRUCTION",
        weight: 100,
      },
    ],
    new DeliveryDate("2022-06-22"),
  );

  // WHEN
  const price = priceCalculationService.calculate(visitorId);

  // THEN
  assertEquals(price, 5);
});

Deno.test("calculate price example 9", () => {
  // PREP
  const { householdRepository, visitService, priceCalculationService } =
    testSetup(aiden.visitorId, aiden.address);
  const johnVisitor = new Visitor(john.visitorId, john.address);
  const household = householdRepository.findByAddress(john.address);
  household.addInhabitant(johnVisitor);
  householdRepository.save(household);

  // GIVEN
  visitService.registerDeliveryForHousehold(
    aiden.address,
    [
      {
        type: "CONSTRUCTION",
        weight: 50,
      },
    ],
    new DeliveryDate("2022-04-07"),
  );
  visitService.registerDeliveryForHousehold(
    john.address,
    [
      {
        type: "CONSTRUCTION",
        weight: 100,
      },
    ],
    new DeliveryDate("2022-06-22"),
  );

  // WHEN
  const price = priceCalculationService.calculate(john.visitorId);

  // THEN
  assertEquals(price, 5);
});

Deno.test("calculate price example 10", () => {
  // PREP
  const { householdRepository, visitService, priceCalculationService } =
    testSetup(aiden.visitorId, aiden.address);
  const johnVisitor = new Visitor(john.visitorId, john.address);
  const household = householdRepository.findByAddress(john.address);
  household.addInhabitant(johnVisitor);
  householdRepository.save(household);

  // GIVEN
  visitService.registerDeliveryForHousehold(
    aiden.address,
    [
      {
        type: "CONSTRUCTION",
        weight: 50,
      },
    ],
    new DeliveryDate("2022-04-07"),
  );
  visitService.registerDeliveryForHousehold(
    john.address,
    [
      {
        type: "GREEN WASTE",
        weight: 100,
      },
    ],
    new DeliveryDate("2022-06-21"),
  );
  visitService.registerDeliveryForHousehold(
    john.address,
    [
      {
        type: "CONSTRUCTION",
        weight: 100,
      },
    ],
    new DeliveryDate("2022-06-22"),
  );

  // WHEN
  const price = priceCalculationService.calculate(john.visitorId);

  // THEN
  assertEquals(price, 5);
});
