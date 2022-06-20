import DeliveryDate from "./DeliveryDate.ts";

export type fractionType = "CONSTRUCTION" | "GREEN WASTE";

export type deliveredFraction = {
  weight: number;
  type: fractionType;
};

export type delivery = {
  deliveryDate: DeliveryDate;
  deliveredFractions: deliveredFraction[];
};
