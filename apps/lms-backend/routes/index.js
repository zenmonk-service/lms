const { MethodNotAllowedError } = require("../middleware/error");

const router = require("express").Router();

router.use((req, res, next) => {
  const hasHandler = router.stack.find(
    (layer) => layer.route && layer.route.path === req.path
  );
  if (hasHandler && !hasHandler.route.methods[req.method.toLowerCase()]) {
    next(new MethodNotAllowedError({ method: req.method, path: req.path }));
  } else {
    next();
  }
});
router.use("/users", require("./user-route"));
router.use("/organizations", require("../middleware/auth-middleware").authenticate, require("./organization-setting-route"));
router.use("/organizations", require("../middleware/auth-middleware").authenticate, require("./organization-route"));
router.use("/users", require("../middleware/auth-middleware").authenticate, require("./user-leave-route"));
router.use("/leave-types",require("../middleware/auth-middleware").authenticate, require("./leave-type-route"));
router.use("/roles",require("../middleware/auth-middleware").authenticate, require("./role-route"));
router.use("/permissions",require("../middleware/auth-middleware").authenticate, require("./permission-route"));
router.use("/users", require("../middleware/auth-middleware").authenticate, require("./user-attendance-route"));
router.use("/leave-requests",require("../middleware/auth-middleware").authenticate, require("./leave-request-route"));
router.use("/attendances",require("../middleware/auth-middleware").authenticate, require("./attendance-route"));
router.use("/holidays", require("../middleware/auth-middleware").authenticate,require("./holiday-route"));
module.exports = router;
