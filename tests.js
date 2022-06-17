import { assert } from "https://deno.land/std@0.143.0/testing/asserts.ts";

class VisitService {
  registerDelivery() {}
}

class PriceCalculationService {
  calculate() {
    return 0;
  }
}
Deno.test("calculate price example 1", () => {
  // PREP
  const visitService = new VisitService();
  const priceCalculationService = new PriceCalculationService();

  // GIVEN
  visitService.registerDelivery([]);

  // WHEN
  const price = priceCalculationService.calculate();

  // THEN
  assert(price == 0);
});

Deno.test("calculate price example 2", () => {
  // PREP
  const visitService = new VisitService();
  const priceCalculationService = new PriceCalculationService();

  // GIVEN
  visitService.registerDelivery([{deliveryType: "CONSTRUCTION", weight: 200}]);

  // WHEN
  const price = priceCalculationService.calculate();

  // THEN
  assert(price == 0.2);
});
