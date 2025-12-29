const { holidayRepository } = require("../repositories/holiday-repository");

exports.validateQueryParameters = async (payload) => {
  let { archive = false, order, order_column } = payload.query;

  // Convert archive string to a boolean
  if (archive === "true" || archive === true) payload.query.archive = true;
  else payload.query.archive = false;

  // Validate and adjust order parameter
  if (
    order &&
    !(order.toLowerCase() === "asc" || order.toLowerCase() === "desc")
  )
    payload.query.order = "DESC";
  else payload.query.order = order?.toUpperCase() || "DESC";

  // Validate and adjust order_column parameter against available columns
  const columns = await holidayRepository.allColumnsName();
  if ((order_column && !columns[order_column]) || !order_column) {
    payload.query.order_column = "updated_at";
  }

  return payload;
};

exports.getFilteredHolidays = async (payload) => {
  payload = await this.validateQueryParameters(payload);
  let { date_observed, order, order_column } = payload.query;

  let response = await holidayRepository.getFilteredHolidays(
    { date_observed },
    { order_type: order, order_column }
  );

  return {
    total: response.length,
    rows: response,
  };
};

exports.createHoliday = async (payload) => {
  return holidayRepository.createHoliday(payload.body);
};

exports.getHolidayById = async (payload) => {
  const { holiday_uuid } = payload.params;
  return holidayRepository.getHolidayById(holiday_uuid);
};

exports.updateHolidayById = async (payload) => {
  const { holiday_uuid } = payload.params;
  const holiday = payload.body;
  const [affected_rows, [response]] = await holidayRepository.updateHolidayById(
    holiday_uuid,
    holiday
  );
  return response;
};
