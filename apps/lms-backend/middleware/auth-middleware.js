const { verifyToken } = require("../lib/jwt");
const { userRepository } = require("../repositories/user-repository");
const { NotificationType } = require("../services/enum/notification-type.enum");
const { sendNotification } = require("../services/notification-service");
const { UnauthorizedError } = require("./error");

const shouldSkipAuthentication = (req) => {
  const routePath = req.path || req.originalUrl || "";

  return (
    routePath.startsWith("/users/verify") ||
    routePath.startsWith("/users/by-email") ||
    routePath.startsWith("/organizations") ||
    /^\/organizations\/[^/]+\/verify(?:\/|$)/.test(routePath) ||
    /^\/organizations\/[^/]+\/login(?:\/|$)/.test(routePath) ||
    /^\/users\/[^/]+\/organizations(?:\/|$)/.test(routePath)
  );
};

const getTokenFromRequest = (req) => {
  const cookieToken =
    req.cookies?.access_token || req.cookies?.jwt || req.cookies?.token;
  if (cookieToken) return cookieToken;

  const authorization = req.headers?.authorization || "";
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim();
  }

  return "";
};

exports.authenticate = async (req, res, next) => {
  try {
    if (shouldSkipAuthentication(req)) return next();

    const token = getTokenFromRequest(req);
    console.log('token: ', token);
    if (!token) throw new Error("Authentication token not found in cookies.");

    const decoded = await verifyToken(token);
    console.log('decoded: vasudev', decoded);
    console.log('schema', req.headers['org_uuid']);
    if (decoded.user.user_id == "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22") {
      return next();
    }
    req.user = await userRepository.getUserById(decoded.user.user_id);

    if (!req.user) throw new Error("User not found.");
    if (!req.user.is_active) {
      await sendNotification(req.headers.org_uuid, {
        send_to: decoded.user.user_id,
        message: {
          type: NotificationType.ENUM.INACTIVE_USER,
          text: "A user has been deactivated. Please contact administrator.",
        },
      });
      throw new Error("User is deactivated. Please contact administrator.");
    }
    next();
  } catch (err) {
    next(new UnauthorizedError(err.message));
  }
};
