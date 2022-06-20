// we have 2 new requirements:
// 1. the exemptions are calculated per year, so every calendar year you get the exemptions again
// 2. the exemptions are calculated per household (based on address), so multiple people living together get the exemptions only 1 time
export default class DeliveryDate {
  private readonly date: string;
  constructor(date: string) {
    this.date = date;
  }
  inCalendarYear(calendarYear: string) {
    return false;
  }
}
