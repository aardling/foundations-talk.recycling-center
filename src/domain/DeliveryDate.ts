export default class DeliveryDate {
  private readonly date: string;
  constructor(date: string) {
    this.date = date;
  }
  inCalendarYear(calendarYear: string) {
    return this.date.startsWith(calendarYear)
  }
}
