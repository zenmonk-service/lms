// const { redis } = require("../lib/redis-services");
const { UnauthorizedError } = require("./error");
// const redisService = require('../lib/redis-services')

exports.acl = (permission_name, action_name) => {
  return async (req, res, next) => {
    const permissions = req.user.role.role_permissions;

    const hasPermission = permissions.some((permission) => {
      return (
        permission.tag === permission_name && permission.action === action_name
      );
    });

    if (!hasPermission) {
      return next(
        new UnauthorizedError("Not validated to perform this action."),
      );
    }
  };
};
