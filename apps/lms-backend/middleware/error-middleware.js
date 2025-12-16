const sad = require("sequelize/lib/utils");
const { CustomError, SequelizeError } = require("./error");
const { BaseError } = require("sequelize");
const { HTTP_STATUS_CODE } = require("../lib/constants");

function isInstanceOfOrExtends(instance, clazz) {
  let proto = Object.getPrototypeOf(instance);
  while (proto) {
    if (proto.constructor === clazz) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}

exports.errorMiddleware = async (error, req, res, next) => {
  let err = error;
  const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

  const isValidError = isInstanceOfOrExtends(err, CustomError);
  const isSequelizeError = isInstanceOfOrExtends(err, BaseError);

  if (isSequelizeError) {
    err = new SequelizeError(err);
  }

  res.set("Content-Type", "application/problem+json");

  if (!isValidError && !isSequelizeError) {
    err = new CustomError(undefined, undefined, err.message, HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR);
  }

  err.setErrorType(fullUrl);
  err.setErrorMethod(req.method);
  res.status(err.getStatusCode()).json(err.getErrorMessage());
};
