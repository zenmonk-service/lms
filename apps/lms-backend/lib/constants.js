const { literal, fn } = require("sequelize");
const { Period, TimePeriod, HTTP_STATUS_CODE } = require("@repo/common");

const countByStatus = (status, alias) => [
  fn("COUNT", literal(`CASE WHEN status = '${status}' THEN 1 END`)),
  alias,
];

function isPeriodApplicable(period) {
  const month = Period.getCurrentMonth();

  switch (period) {
    case TimePeriod.ENUM.MONTHLY:
      return true;

    case TimePeriod.ENUM.QUARTERLY:
      return month % 3 === 0;

    case TimePeriod.ENUM.HALF_YEARLY:
      return [6, 12].includes(month);

    case TimePeriod.ENUM.YEARLY:
      return month === 12;

    default:
      return false;
  }
}

module.exports = {
  HTTP_STATUS_CODE,
  countByStatus,
  isPeriodApplicable
};
