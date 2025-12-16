const { Sequelize } = require("sequelize");
const { HTTP_STATUS_CODE } = require("../lib/constants");

class CustomError {
  statusCode = HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR;

  constructor(
    title = "INTERNAL SERVER ERROR",
    description = "INTERNAL SERVER ERROR",
    error = {},
    statusCode = HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR
  ) {
    this.message = {
      title,
      description,
      error,
    };

    this.statusCode = statusCode;
  }

  setErrorType(type = "") {
    this.type = type;
  }

  setErrorMethod(method = "") {
    this.method = method;
  }

  getErrorMessage(error = "") {
    return {
      method: this.method,
      type: this.type,
      title: this.message.title,
      description: this.message.description,
      error: error || this.message.error,
    };
  }

  getStatusCode() {
    return this.statusCode;
  }
}

class SequelizeError extends CustomError {
  constructor(error) {
    let title = "Sequelize Error";
    let description = "Sequelize Error";
    let statusCode = HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR;
    if (error instanceof Sequelize.UniqueConstraintError) {
      title = "Conflict";
      description = "Conflict";
      statusCode = HTTP_STATUS_CODE.ENUM.CONFLICT;
    }

    if (
      error instanceof Sequelize.ValidationError ||
      error instanceof Sequelize.AggregateError
    ) {
      title = "Bad Request";
      description = "Invalid payload.";
      statusCode = HTTP_STATUS_CODE.ENUM.BAD_REQUEST;
    }
    if (
      error instanceof Sequelize.UniqueConstraintError ||
      error?.original?.code === "23505"
    ) {
      title = "Validation Error";
      statusCode = HTTP_STATUS_CODE.ENUM.BAD_REQUEST;
      const detail = error?.original?.detail || "";
      const m = detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
      description = m
        ? `Duplicate entry for ${m[1]
            .split(/\s*,\s*/)
            .map((c, i) => `${c}: ${m[2].split(/\s*,\s*/)[i] || "?"}`)
            .join(", ")}`
        : error.constraint
        ? `Duplicate entry violates ${error.constraint}`
        : "Duplicate value";
    }
    if (error instanceof Sequelize.EmptyResultError) {
      title = "Not Found";
      description = "Not Found";
      statusCode = HTTP_STATUS_CODE.ENUM.NOT_FOUND;
    }

    if (error instanceof Sequelize.DatabaseError) {
      if (error.parent.code === "22P02") {
        title = "Bad Request";
        description = "Provided uuid is invalid.";
        statusCode = HTTP_STATUS_CODE.ENUM.BAD_REQUEST;
      } else if (error.parent.code === "21000") {
        title = "Conflict";
        description = "Same resource already exists";
        statusCode = HTTP_STATUS_CODE.ENUM.CONFLICT;
      } else {
        title = "Sequelize Database Error";
        description = "Sequelize Database Error";
        statusCode = HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR;
      }
    }

    super(
      title,
      description,
      { ...error.original, message: error.message } ||
        error.errors ||
        error.error ||
        error.message,
      statusCode
    );
  }

  getErrorMessage() {
    delete this.message.error.parent;
    delete this.message.error.original?.sql;
    delete this.message.error.sql;
    return {
      method: this.method,
      type: this.type,
      title: this.message.title,
      description: this.message.description,
      error: this.message.error,
    };
  }
}

class BadRequestError extends CustomError {
  constructor(error, description = "Bad Request") {
    super("Bad Request", description, error, HTTP_STATUS_CODE.ENUM.BAD_REQUEST);
  }
}

class UnauthorizedError extends CustomError {
  constructor(error, description = "Unauthorized") {
    super(
      "Unauthorized",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.UNAUTHORIZED
    );
  }
}

class ForbiddenError extends CustomError {
  constructor(error, description = "Forbidden") {
    super("Forbidden", description, error, HTTP_STATUS_CODE.ENUM.FORBIDDEN);
  }
}

class NotFoundError extends CustomError {
  constructor(error, description = "Not Found") {
    super("Not Found", description, error, HTTP_STATUS_CODE.ENUM.NOT_FOUND);
  }
}

class MethodNotAllowedError extends CustomError {
  constructor(error, description = "Method Not Allowed") {
    super(
      "Method Not Allowed",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.METHOD_NOT_ALLOWED
    );
  }
}

class NotAcceptableError extends CustomError {
  constructor(error, description = "Not Acceptable") {
    super(
      "Not Acceptable",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.NOT_ACCEPTABLE
    );
  }
}

class RequestTimeoutError extends CustomError {
  constructor(error, description = "Request Timeout") {
    super(
      "Request Timeout",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.REQUEST_TIMEOUT
    );
  }
}

class ConflictError extends CustomError {
  constructor(error, description = "Conflict") {
    super("Conflict", description, error, HTTP_STATUS_CODE.ENUM.CONFLICT);
  }
}

class GoneError extends CustomError {
  constructor(error, description = "Gone") {
    super("Gone", description, error, HTTP_STATUS_CODE.ENUM.GONE);
  }
}

class LengthRequiredError extends CustomError {
  constructor(error, description = "Length Required") {
    super(
      "Length Required",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.LENGTH_REQUIRED
    );
  }
}

class PreconditionFailedError extends CustomError {
  constructor(error, description = "Precondition Failed") {
    super(
      "Precondition Failed",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.PRECONDITION_FAILED
    );
  }
}

class PayloadTooLargeError extends CustomError {
  constructor(error, description = "Payload Too Large") {
    super(
      "Payload Too Large",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.PAYLOAD_TOO_LARGE
    );
  }
}

class URITooLongError extends CustomError {
  constructor(error, description = "URI Too Long") {
    super(
      "URI Too Long",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.URI_TOO_LONG
    );
  }
}

class UnsupportedMediaTypeError extends CustomError {
  constructor(error, description = "Unsupported Media Type") {
    super(
      "Unsupported Media Type",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.UNSUPPORTED_MEDIA_TYPE
    );
  }
}

class TooManyRequestsError extends CustomError {
  constructor(error, description = "Too Many Requests") {
    super(
      "Too Many Requests",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.TOO_MANY_REQUESTS
    );
  }
}

class InternalServerErrorError extends CustomError {
  constructor(error, description = "Internal Server Error") {
    super(
      "Internal Server Error",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.INTERNAL_SERVER_ERROR
    );
  }
}

class NotImplementedError extends CustomError {
  constructor(error, description = "Not Implemented") {
    super(
      "Not Implemented",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.NOT_IMPLEMENTED
    );
  }
}

class BadGatewayError extends CustomError {
  constructor(error, description = "Bad Gateway") {
    super("Bad Gateway", description, error, HTTP_STATUS_CODE.ENUM.BAD_GATEWAY);
  }
}

class ServiceUnavailableError extends CustomError {
  constructor(error, description = "Service Unavailable") {
    super(
      "Service Unavailable",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.SERVICE_UNAVAILABLE
    );
  }
}

class GatewayTimeoutError extends CustomError {
  constructor(error, description = "Gateway Timeout") {
    super(
      "Gateway Timeout",
      description,
      error,
      HTTP_STATUS_CODE.ENUM.GATEWAY_TIMEOUT
    );
  }
}

module.exports = {
  CustomError,
  SequelizeError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  NotAcceptableError,
  RequestTimeoutError,
  ConflictError,
  GoneError,
  LengthRequiredError,
  PreconditionFailedError,
  PayloadTooLargeError,
  URITooLongError,
  UnsupportedMediaTypeError,
  TooManyRequestsError,
  InternalServerErrorError,
  NotImplementedError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
};
