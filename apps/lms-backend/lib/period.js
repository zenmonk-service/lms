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
}

module.exports = Period;
