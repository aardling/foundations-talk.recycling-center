import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";

import DeliveryDate from "./src/domain/DeliveryDate.ts";
import Address from "./src/domain/Address.ts";
import PriceCalculationService from "./src/domain/PriceCalculationService.ts";
import Inhabitant from "./src/domain/Inhabitant.ts";
import VisitService from "./src/domain/VisitService.ts";
import HouseholdRepository from "./src/domain/HouseholdRepository.ts";
import Household from "./src/domain/Household.ts";
import Weight from "./src/domain/Weight.ts";
import CalculationRules, {
  NoExemptionRule,
  ExemptionRule,
  PriceCalculationRule,
} from "./src/domain/CalculationRules.ts";
import { fractionType } from "./src/domain/Delivery.ts";
import { Price } from "./src/domain/Price.ts";

class InMemHouseholdRepository implements HouseholdRepository {
  private households: { [key: string]: Household } = {};
  private householdsByInhabitant: { [key: string]: Household } = {};
  save(household: Household): void {
    household.inhabitants.forEach((inhabitant) => {
      this.householdsByInhabitant[inhabitant.id] = household;
    });
    this.households[household.id] = household;
  }
  findByAddress(address: Address): Household {
    return this.households[address.id];
  }
  findByInhabitant(inhabitant: Inhabitant): Household {
    return this.householdsByInhabitant[inhabitant.id];
  }
}
class InMemCalculationRules implements CalculationRules {
  private readonly exemptionRules: { [key: string]: ExemptionRule } = {};
  private readonly priceCalculationRules: {
    [key: string]: PriceCalculationRule;
  } = {};
  addExemptionRule(exemptionRule: ExemptionRule): void {
    this.exemptionRules[
      this.key(exemptionRule.city, exemptionRule.fractionType)
    ] = exemptionRule;
  }
  findExemptionRule(city: string, fractionType: fractionType): ExemptionRule {
    return (
      this.exemptionRules[this.key(city, fractionType)] || new NoExemptionRule()
    );
  }

  addPriceCalculationRule(priceCalculationRule: PriceCalculationRule): void {
    this.priceCalculationRules[priceCalculationRule.fractionType] =
      priceCalculationRule;
  }
  findCalculationRule(
    city: string,
    fractionType: fractionType
  ): PriceCalculationRule {
    return this.priceCalculationRules[fractionType];
  }

  private key(city: string, fractionType: string) {
    return `${city}-${fractionType}`;
  }
}

const Kg25 = new Weight(25, "kg");
const Kg50 = new Weight(50, "kg");
const Kg100 = new Weight(100, "kg");
const Kg150 = new Weight(150, "kg");
const Kg200 = new Weight(200, "kg");

function testSetup(inhabitant: Inhabitant) {
  const householdRepository = new InMemHouseholdRepository();
  const calculationRules = new InMemCalculationRules();
  calculationRules.addExemptionRule(
    new ExemptionRule("Pineville", "CONSTRUCTION", Kg100)
  );
  calculationRules.addPriceCalculationRule(
    new PriceCalculationRule("CONSTRUCTION", new Price(0.1, "EUR"))
  );
  calculationRules.addPriceCalculationRule(
    new PriceCalculationRule("GREEN WASTE", new Price(0.2, "EUR"))
  );
  const visitService = new VisitService(householdRepository);

  const priceCalculationService = new PriceCalculationService(
    householdRepository,
    calculationRules
  );
  const houseHold = new Household(inhabitant.address);
  houseHold.addInhabitant(inhabitant);
  householdRepository.save(houseHold);
  return {
    householdRepository,
    visitService,
    priceCalculationService,
  };
}

const deliveryDate = new DeliveryDate("2022-06-20");

const kasey = new Inhabitant(
  "Kasey",
  new Address("Eveningred 31", "Moon village")
);

const aiden = new Inhabitant(
  "Aiden",
  new Address("Green Street 103", "Pineville")
);

const john = new Inhabitant(
  "John",
  new Address("Green Street 103", "Pineville")
);

Deno.test("calculate price example 1", () => {
  // PREP
  const { visitService, priceCalculationService } = testSetup(kasey);

  // GIVEN
  visitService.registerDelivery(kasey, [], deliveryDate);

  // WHEN
  const price = priceCalculationService.calculate(kasey);

  // THEN
  assertEquals(price.amount, 0);
});

Deno.test("calculate price example 2", () => {
  // PREP
  const { visitService, priceCalculationService } = testSetup(kasey);

  // GIVEN
  visitService.registerDelivery(
    kasey,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg200,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(kasey);

  // THEN
  assertEquals(price.amount, 20);
});

Deno.test("calculate price example 3", () => {
  // PREP
  const { visitService, priceCalculationService } = testSetup(aiden);

  // GIVEN
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg200,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(aiden);

  // THEN
  assertEquals(price.amount, 10);
});

Deno.test("calculate price example 4", () => {
  // PREP
  const { visitService, priceCalculationService } = testSetup(aiden);

  // GIVEN
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg50,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg25,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg100,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(aiden);

  // THEN
  assertEquals(price.amount, 7.5);
});

Deno.test("calculate price example 5", () => {
  // PREP
  const { visitService, priceCalculationService } = testSetup(aiden);

  // GIVEN
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg50,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg25,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg100,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg100,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(aiden);

  // THEN
  assertEquals(price.amount, 10);
});

Deno.test("calculate price example 6", () => {
  // PREP
  const { visitService, priceCalculationService } = testSetup(aiden);

  // GIVEN
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg25,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(aiden);

  // THEN
  assertEquals(price.amount, 0);
});

Deno.test("calculate price example 7", () => {
  // PREP
  const { visitService, priceCalculationService } = testSetup(aiden);

  // GIVEN
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg25,
      },
    ],
    deliveryDate
  );
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "GREEN WASTE",
        weight: Kg100,
      },
    ],
    deliveryDate
  );

  // WHEN
  const price = priceCalculationService.calculate(aiden);

  // THEN
  assertEquals(price.amount, 20);
});

// we have 2 new requirements:
// 1. the exemptions are calculated per year, so every calendar year you get the exemptions again
// 2. the exemptions are calculated per household (based on address), so multiple people living together get the exemptions only 1 time

Deno.test("calculate price example 8", () => {
  // PREP
  const { visitService, priceCalculationService } = testSetup(aiden);

  // GIVEN
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg150,
      },
    ],
    new DeliveryDate("2021-10-02")
  );
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg50,
      },
    ],
    new DeliveryDate("2022-04-07")
  );
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg100,
      },
    ],
    new DeliveryDate("2022-06-22")
  );

  // WHEN
  const price = priceCalculationService.calculate(aiden);

  // THEN
  assertEquals(price.amount, 5);
});

Deno.test("calculate price example 9", () => {
  // PREP
  const { householdRepository, visitService, priceCalculationService } =
    testSetup(aiden);
  const household = householdRepository.findByAddress(john.address);
  household.addInhabitant(john);
  householdRepository.save(household);

  // GIVEN
  visitService.registerDelivery(
    aiden,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg50,
      },
    ],
    new DeliveryDate("2022-04-07")
  );
  visitService.registerDelivery(
    john,
    [
      {
        type: "CONSTRUCTION",
        weight: Kg100,
      },
    ],
    new DeliveryDate("2022-06-22")
  );

  // WHEN
  const price = priceCalculationService.calculate(john);

  // THEN
  assertEquals(price.amount, 5);
});
