import Household from "./Household.ts";

export default interface HouseholdRepository {
  save(houseHold: Household): void;
  findById(id: string): Household;
}
