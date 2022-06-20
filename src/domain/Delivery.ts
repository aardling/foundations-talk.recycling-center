import DeliveryDate from "./DeliveryDate.ts";

export type deliveredFraction = {
  weight: number;
  type: string;
};

export type delivery = {
  deliveryDate: DeliveryDate;
  deliveredFractions: deliveredFraction[];
};
