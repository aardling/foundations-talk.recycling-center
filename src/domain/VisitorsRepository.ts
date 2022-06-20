import Visitor from "./Visitor.ts";

export default interface VisitorsRepository {
  save(visitor: Visitor): void;
  findById(id: string): Visitor | null;
}
