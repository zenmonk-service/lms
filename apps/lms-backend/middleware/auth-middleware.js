const { verifyToken } = require("../lib/jwt");
const { userRepository } = require("../repositories/user-repository");
const { UnauthorizedError } = require("./error");

const shouldSkipAuthentication = (req) => {
  const routePath = req.path || req.originalUrl || "";

  return (
    routePath.startsWith("/users/verify") ||
    routePath.startsWith("/users/by-email") ||
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
    console.log(req.path)
    console.log('shouldSkipAuthentication(req): ', shouldSkipAuthentication(req));
    if (shouldSkipAuthentication(req)) return next();

    const token = getTokenFromRequest(req);
    if (!token) throw new Error("Authentication token not found in cookies.");

    const decoded = await verifyToken(token);
    req.user = await userRepository.getUserById(decoded.user.user_id);

    if (!req.user) throw new Error("User not found.");
    if (!req.user.is_active) throw new Error("User is inactive.");
    next();
  } catch (err) {
    next(new UnauthorizedError(err.message));
  }
};
