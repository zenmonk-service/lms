const router = require("express").Router();
const { roleControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action, Permission } = require("@repo/common");

router
  .route("/")
  .get(roleControllers.getFilteredRoles)
  .post(acl(Permission.ENUM.ROLE_MANAGEMENT, Action.ENUM.CREATE),roleControllers.createRole);

router
  .route("/:role_uuid")
  .get(roleControllers.getRoleById)
  .put(roleControllers.updateRole);

router.put(
  "/:role_uuid/permissions",
  roleControllers.updateRolePermissions
);
module.exports = router;
