import Visitor from "./Visitor.ts";
import VisitorsRepository from "./VisitorsRepository.ts";

export class InMemVisitorsRepository implements VisitorsRepository {
  private visitors: { [key: string]: Visitor; } = {};
  save(visitor: Visitor): void {
    this.visitors[visitor.id] = visitor;
  }
  findById(id: string): Visitor | null {
    return this.visitors[id];
  }
}
