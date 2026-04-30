declare module 'date-holidays' {
  export default class Holidays {
    constructor(country?: string, state?: string, region?: string);
    init(country?: string, state?: string, region?: string): void;
    getHolidays(year?: number | string | Date): unknown[];
    isHoliday(date: Date | string): unknown[] | false;
  }
}

