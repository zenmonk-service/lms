const moment = require("moment-timezone");
class Period {
  static timezone = process.env.TIMEZONE;
  static now = new Date();

  static getCurrentPeriod() {
    const currentMonth = `${this.now.getFullYear()}-${String(
      this.now.getMonth() + 1,
    ).padStart(2, "0")}`;

    return currentMonth;
  }

  static getPreviousPeriod() {
    const previousMonth = `${this.now.getFullYear()}-${String(
      this.now.getMonth(),
    ).padStart(2, "0")}`;

    return previousMonth;
  }

  static comparePeriods(period1, period2) {
    if (period1 === period2) return 0;
    if (period1 > period2) return 1;
    return -1;
  }

  static convertTime(value) {
    if (!value || typeof value !== "number") {
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

  static convertDate(value) {
    if (!value || typeof value !== "number") {
      return null;
    }

    const days = Math.floor(value) - 2;

    return moment("1900-01-01")
      .add(days, "days")
      .tz(this.timezone)
      .format("YYYY-MM-DD");
  }

  static convertTimeToMinutes(time) {
    const [hours, minutes] = String(time).split(":").map(Number);

    return hours * 60 + minutes;
  }

  static getCurrentTime() {
    return moment().tz(this.timezone).format("HH:mm:ss");
  }

  static getCurrentDate() {
    return moment().tz(this.timezone).format("YYYY-MM-DD");
  }

  static getHoursDifference(startTime, endTime) {
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

  static convertDateFromISO(value) {
    if (!value) return null;
    return moment(value).tz(this.timezone).format("YYYY-MM-DD");
  }

static convertPeriodFromDate(value) {
  if (!value) return null;
  return moment(value).tz(this.timezone).format("YYYY-MM");
}

  static getPeriodDateRange(period) {
    const startDate = moment(period, "YYYY-MM")
      .startOf("month")
      .format("YYYY-MM-DD");

    const endDate = moment(period, "YYYY-MM")
      .endOf("month")
      .format("YYYY-MM-DD");

    return {
      start_date: startDate,
      end_date: endDate,
    };
  }
}

module.exports = Period;
