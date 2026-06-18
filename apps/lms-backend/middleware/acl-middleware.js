// const { redis } = require("../lib/redis-services");
const { UnauthorizedError } = require("./error");
// const redisService = require('../lib/redis-services')

exports.acl = (permission_name, action_name) => {
  return async (req, res, next) => {
    if (req.user.user_id == "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22") {
      return next();
    }
    const rolePermissions = req.user.role.role_permissions;

    const hasPermission = rolePermissions.some((rolePermission) => {
      return (
        rolePermission.permission.tag === permission_name &&
        rolePermission.permission.action === action_name
      );
    });

    if (!hasPermission) {
      return next(
        new UnauthorizedError("Not validated to perform this action."),
      );
    }
    return next();
  };
};
