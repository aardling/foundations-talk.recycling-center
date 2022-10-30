import Address from "./Address.ts";
import Visitor from "./Visitor.ts";
import HouseholdRepository from "./HouseholdRepository.ts";
import Household from "./Household.ts";

export class InMemHouseholdRepository implements HouseholdRepository {
  private households: { [key: string]: Household; } = {};
  private householdsByVisitor: { [key: string]: Household; } = {};
  save(household: Household): void {
    household.inhabitants.forEach((visitor) => {
      this.householdsByVisitor[visitor.id] = household;
    });
    this.households[household.id] = household;
  }
  findByAddress(address: Address): Household {
    return this.households[address.id];
  }
  findByVisitor(visitor: Visitor): Household {
    return this.householdsByVisitor[visitor.id];
  }
  findByVisitorId(id: string): Household {
    return this.householdsByVisitor[id];
  }
}
