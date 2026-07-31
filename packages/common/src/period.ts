import moment from "moment-timezone";

export class Period {
  private static timezone = "UTC";

  static setTimezone(timezone: string) {
    this.timezone = timezone;
  }

  static getCurrentPeriod(): string {
    return moment().tz(this.timezone).format("YYYY-MM");
  }

  static getPreviousPeriod(): string {
    return moment().tz(this.timezone).subtract(1, "month").format("YYYY-MM");
  }

  static comparePeriods(period1: string, period2: string): number {
    if (period1 === period2) {
      return 0;
    }

    return period1 > period2 ? 1 : -1;
  }

  static convertTime(value: number | null): string | null {
    if (value == null) {
      return null;
    }

    const totalSeconds = Math.round((value % 1) * 24 * 60 * 60);

    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");

    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0",
    );

    return `${hours}:${minutes}:00`;
  }

  static convertDate(value: number | null): string | null {
    if (value == null) {
      return null;
    }

    return moment("1900-01-01")
      .add(Math.floor(value) - 2, "days")
      .tz(this.timezone)
      .format("YYYY-MM-DD");
  }

  static convertTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
  }

  static getCurrentTime(): string {
    return moment().tz(this.timezone).format("HH:mm:ss");
  }

  static getCurrentDate(): string {
    return moment().tz(this.timezone).format("YYYY-MM-DD");
  }

  static getHoursDifference(
    startTime: string | null,
    endTime: string | null,
  ): number {
    if (!startTime || !endTime) {
      return 0;
    }

    const start = moment.tz(
      `2000-01-01 ${startTime}`,
      "YYYY-MM-DD HH:mm:ss",
      this.timezone,
    );

    const end = moment.tz(
      `2000-01-01 ${endTime}`,
      "YYYY-MM-DD HH:mm:ss",
      this.timezone,
    );

    return Number(moment.duration(end.diff(start)).asHours().toFixed(2));
  }

  static convertDateFromISO(value: string | Date): string {
    return moment(value).tz(this.timezone).format("YYYY-MM-DD");
  }

  static convertPeriodFromDate(value: string | Date): string {
    return moment(value).tz(this.timezone).format("YYYY-MM");
  }

  static getPeriodDateRange(period: string): {
    start_date: string;
    end_date: string;
  } {
    return {
      start_date: moment(period, "YYYY-MM")
        .startOf("month")
        .format("YYYY-MM-DD"),

      end_date: moment(period, "YYYY-MM").endOf("month").format("YYYY-MM-DD"),
    };
  }
}
