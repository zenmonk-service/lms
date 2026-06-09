const { runWithSchema } = require("../lib/schema");


exports.changeSchema = (req, res, next) => {
  const uuid = req.headers["org_uuid"];
  runWithSchema(uuid, next);
};
