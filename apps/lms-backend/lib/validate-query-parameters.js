const { BadRequestError } = require("../middleware/error");
const { isValidDate } = require("../models/common/validator");

exports.validatingQueryParameters = async ({ repository, ...payload }) => {
  let {
    user_uuid,
    leave_type_uuid,
    manager_uuid,
    date,
    start_date,
    end_date,
    date_range,
    managers,
    status,
    order,
    order_column,
    archive = false,
  } = payload.query;

  if (archive === "true" || archive === true) payload.query.archive = true;
  else payload.query.archive = false;

  if (date && !isValidDate(date))
    throw new BadRequestError(
      "Invalid date.",
      "Date parameter is not a valid date string.",
    );
  // if (date) payload.query.date = new Date(date);

  if (start_date && !isValidDate(start_date))
    throw new BadRequestError(
      "Invalid start date.",
      "Start date parameter is not a valid date string.",
    );

  if (end_date && !isValidDate(end_date))
    throw new BadRequestError(
      "Invalid end date.",
      "End date parameter is not a valid date string.",
    );

  if (date_range && !Array.isArray(date_range) && date_range.length != 2)
    throw new BadRequestError(
      "Invalid date_range.",
      "Date range must include start date and end date.",
    );
  if (user_uuid && !isValidUUID(user_uuid))
    throw new BadRequestError(
      "Invalid user uuid.",
      "User uuid is not a valid uuid string.",
    );

  if (leave_type_uuid && !isValidUUID(leave_type_uuid))
    throw new BadRequestError(
      "Invalid leave type uuid.",
      "Leave type uuid is not a valid uuid string.",
    );

  if (manager_uuid && !isValidUUID(manager_uuid))
    throw new BadRequestError(
      "Invalid manager uuid.",
      "Manager uuid is not a valid uuid string.",
    );

  if (
    order &&
    !(order.toLowerCase() === "asc" || order.toLowerCase() === "desc")
  )
    payload.query.order = "DESC";
  else payload.query.order = order?.toUpperCase() || "DESC";

  const columns = await repository.allColumnsName();
  if ((order_column && !columns[order_column]) || !order_column) {
    payload.query.order_column = "updated_at";
  }

  return payload;
};
