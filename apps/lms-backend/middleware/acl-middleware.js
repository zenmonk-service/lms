const {
  publicUserRepository,
} = require("../repositories/public-user-repository");
const { userRepository } = require("../repositories/user-repository");
const { NotificationType } = require("@repo/common");
const { sendNotification } = require("../services/notification-service");
const { UnauthorizedError } = require("./error");

const isMeRoute = new Set([
  "/users/:user_uuid",
  "/attendances/",
  "/roles/:role_uuid/permissions",
  "/leave-types/user/:user_uuid/balances",
]);

const isFilterRoute = new Set(["/users/", "/leave-types/", "/roles/"]);

function getRoutePath(req) {
  const routePath = req.route?.path;

  if (!routePath) {
    return req.path;
  }

  return `${req.baseUrl}${routePath}`;
}

exports.acl = (permission_name, action_name) => {
  return async (req, res, next) => {
    const decoded = req.decoded;

    if (decoded.user.user_id === process.env.SUPERADMIN_UUID) {
      req.user = {
        user_id: decoded.user.user_id,
      };
      return next();
    }

    req.user = await userRepository.getUserById({
      user_uuid: decoded.user.user_id,
    });

    if (!req.user) {
      throw new UnauthorizedError("User not found.");
    }

    if (!req.user.is_active) {
      await sendNotification(req.headers.org_uuid, {
        send_to: decoded.user.user_id,
        message: {
          type: NotificationType.ENUM.INACTIVE_USER,
          text: "A user has been deactivated. Please contact administrator.",
        },
      });

      throw new UnauthorizedError(
        "User is deactivated. Please contact administrator.",
      );
    }

    const path = getRoutePath(req);
    const isMeRequest = req.headers.is_me === "true";
    const isFilterRequest = req.headers.is_filter === "true";

    if (isMeRequest && isMeRoute.has(path)) {
      req.query.user_uuid = req.user.user_id;
      req.params.user_uuid = req.user.user_id;

      if (path === "/roles/:role_uuid/permissions") {
        req.params.role_uuid = req.user.role.uuid;
      }

      return next();
    }

    if (isFilterRequest && isFilterRoute.has(path)) {
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

exports.validateUser = () => {
  return async (req, res, next) => {
    const user = await publicUserRepository.findOne({
      user_id: req.decoded.user.user_id,
    });

    if (!user) {
      return next(new UnauthorizedError("User not found."));
    }

    req.user = user;

    return next();
  };
};

exports.validateSuperuser = () => {
  return async (req, res, next) => {
    const decoded = req.decoded;

    if (decoded.user.user_id === process.env.SUPERADMIN_UUID) {
      return next();
    }

    return next(
      new UnauthorizedError(
        "User doesnt have permission to perform this exception",
      ),
    );
  };
};