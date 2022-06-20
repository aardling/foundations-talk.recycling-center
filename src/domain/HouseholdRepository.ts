import Address from "./Address.ts";
import Household from "./Household.ts";
import Inhabitant from "./Inhabitant.ts";

export default interface HouseholdRepository {
  save(houseHold: Household): void;
  findByVisitor(visitor: Inhabitant): Household;
  findByVisitorId(id: string): Household;
  findByAddress(address: Address): Household;
}
