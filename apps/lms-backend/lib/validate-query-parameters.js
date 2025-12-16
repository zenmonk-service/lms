
exports.validatingQueryParameters = async ({repository,...payload}) => {
  let { order, order_column, date_range } = payload.query;

  if (date_range && !Array.isArray(date_range)) {
    payload.query.date_range = date_range.split(",");
  }

  // Validate and adjust order parameter
  if (
    order &&
    !(order.toLowerCase() === "asc" || order.toLowerCase() === "desc")
  )
    payload.query.order = "DESC";
  else payload.query.order = order?.toUpperCase() || "DESC";

  // Validate and adjust order_column parameter against available columns
  const columns = await repository.allColumnsName();
  if ((order_column && !columns[order_column]) || !order_column) {
    payload.query.order_column = "updated_at";
  }

  return payload;
};