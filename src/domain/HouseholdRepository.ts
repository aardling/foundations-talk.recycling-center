import Address from "./Address.ts";
import Household from "./Household.ts";
import Visitor from "./Visitor.ts";

export default interface HouseholdRepository {
  save(houseHold: Household): void;
  findByVisitor(visitor: Visitor): Household;
  findByAddress(address: Address): Household;
}
