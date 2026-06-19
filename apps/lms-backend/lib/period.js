const moment = require("moment-timezone");
class Period {
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
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD");
  }

  static convertTimeToMinutes(time) {
    if (!time) return 0;

    const [hours, minutes] = String(time).split(":").map(Number);

    return hours * 60 + minutes;
  }
}

module.exports = Period;
