function findSandwichLeavesBefore(startDate, approvedLeaves, upperLimitStartDates, sandwichLeaves) {
  if (
    approvedLeaves.some((obj) => obj.type === "start") &&
    upperLimitStartDates.length > 0
  ) {
    let leaveObj = approvedLeaves.find((obj) => obj.type === "start");
    let leaveDate = leaveObj ? new Date(leaveObj.date) : null;

    if (leaveDate) {
      let upperLimitStartDate = new Date(leaveDate);
      upperLimitStartDate.setDate(upperLimitStartDate.getDate() + 1);

      while (upperLimitStartDate < startDate) {
        let found = upperLimitStartDates.find((obj) => {
          let objDate = new Date(obj.date);
          return (
            objDate.getDate() === upperLimitStartDate.getDate() &&
            objDate.getMonth() === upperLimitStartDate.getMonth() &&
            objDate.getFullYear() === upperLimitStartDate.getFullYear()
          );
        });

        if (found) {
          sandwichLeaves.push(found.id); // ✅ mutate array directly
        }
        upperLimitStartDate.setDate(upperLimitStartDate.getDate() + 1);
      }
    }
  }
}

function findSandwichLeavesAfter(endDate, approvedLeaves, lowerLimitEndDates, sandwichLeaves) {
  if (
    approvedLeaves.some((obj) => obj.type === "end") &&
    lowerLimitEndDates.length > 0
  ) {
    let leaveObj = approvedLeaves.find((obj) => obj.type === "end");
    let leaveDate = leaveObj ? new Date(leaveObj.date) : null;

    if (leaveDate) {
      let lowerLimitEndDate = new Date(leaveDate);
      lowerLimitEndDate.setDate(lowerLimitEndDate.getDate() - 1);

      while (lowerLimitEndDate > endDate) {
        let found = lowerLimitEndDates.find((obj) => {
          let objDate = new Date(obj.date);
          return (
            objDate.getDate() === lowerLimitEndDate.getDate() &&
            objDate.getMonth() === lowerLimitEndDate.getMonth() &&
            objDate.getFullYear() === lowerLimitEndDate.getFullYear()
          );
        });

        if (found) {
          sandwichLeaves.push(found.id); // ✅ mutate array directly
        }
        lowerLimitEndDate.setDate(lowerLimitEndDate.getDate() - 1);
      }
    }
  }
}


module.exports = {findSandwichLeavesAfter, findSandwichLeavesBefore}
