import { assert } from "https://deno.land/std@0.143.0/testing/asserts.ts";

class VisitService {
  registerDelivery() {}
}

class PriceCalculationService {
  calculate() {}
}
Deno.test("price should be 0 when nothing is delivered", () => {
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
