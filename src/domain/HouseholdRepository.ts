import Address from "./Address.ts";
import Household from "./Household.ts";
import Inhabitant from "./Inhabitant.ts";

export default interface HouseholdRepository {
  save(houseHold: Household): void;
  findByInhabitant(inhabitant: Inhabitant): Household;
  findByAddress(address: Address): Household;
}
