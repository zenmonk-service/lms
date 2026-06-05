const moment = require("moment-timezone");

const DEFAULT_TZ = "Asia/Kolkata";

const toTzMoment = (value) => {
  if (moment.isMoment(value)) {
    return value.clone().tz(DEFAULT_TZ);
  }
  return moment(value).tz(DEFAULT_TZ);
};

function findSandwichLeavesBefore(
  startDate,
  approvedLeaves,
  upperLimitStartDates,
  sandwichLeaves,
) {
  if (
    approvedLeaves.some((obj) => obj.type === "start") &&
    upperLimitStartDates.length > 0
  ) {
    let leaveObj = approvedLeaves.find((obj) => obj.type === "start");
    let leaveDate = leaveObj ? toTzMoment(leaveObj.date) : null;

    if (leaveDate) {
      let upperLimitStartDate = leaveDate.clone().add(1, "day");
      const startMoment = toTzMoment(startDate);

      while (upperLimitStartDate.isBefore(startMoment, "day")) {
        let found = upperLimitStartDates.find((obj) => {
          let objDate = toTzMoment(obj.date);
          return objDate.isSame(upperLimitStartDate, "day");
        });

        if (found) {
          sandwichLeaves.push(found.id); // ✅ mutate array directly
        }
        upperLimitStartDate.add(1, "day");
      }
    }
  }
}

function findSandwichLeavesAfter(
  endDate,
  approvedLeaves,
  lowerLimitEndDates,
  sandwichLeaves,
) {
  if (
    approvedLeaves.some((obj) => obj.type === "end") &&
    lowerLimitEndDates.length > 0
  ) {
    let leaveObj = approvedLeaves.find((obj) => obj.type === "end");
    let leaveDate = leaveObj ? toTzMoment(leaveObj.date) : null;

    if (leaveDate) {
      let lowerLimitEndDate = leaveDate.clone().subtract(1, "day");
      const endMoment = toTzMoment(endDate);

      while (lowerLimitEndDate.isAfter(endMoment, "day")) {
        let found = lowerLimitEndDates.find((obj) => {
          let objDate = toTzMoment(obj.date);
          return objDate.isSame(lowerLimitEndDate, "day");
        });

        if (found) {
          sandwichLeaves.push(found.id); // ✅ mutate array directly
        }
        lowerLimitEndDate.subtract(1, "day");
      }
    }
  }
}


module.exports = {findSandwichLeavesAfter, findSandwichLeavesBefore}
