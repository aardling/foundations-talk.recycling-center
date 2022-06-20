import DeliveryDate from "./DeliveryDate.ts";
import Weight from "./Weight.ts";

export type fractionType = "CONSTRUCTION" | "GREEN WASTE";

export type deliveredFraction = {
  weight: Weight;
  type: fractionType;
};

export type delivery = {
  deliveryDate: DeliveryDate;
  deliveredFractions: deliveredFraction[];
};
