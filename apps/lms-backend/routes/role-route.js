const router = require("express").Router();
const { roleControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router
  .route("/")
  .get(acl(Permission.ENUM.ROLE_MANAGEMENT, Action.ENUM.READ),roleControllers.getFilteredRoles)
  .post(acl(Permission.ENUM.ROLE_MANAGEMENT, Action.ENUM.CREATE),roleControllers.createRole);

router
  .route("/:role_uuid")
  .get(acl(Permission.ENUM.ROLE_MANAGEMENT, Action.ENUM.READ),roleControllers.getRoleById)
  .put(acl(Permission.ENUM.ROLE_MANAGEMENT, Action.ENUM.UPDATE),roleControllers.updateRole);

router.put(
  "/:role_uuid/permissions",acl(Permission.ENUM.ROLE_MANAGEMENT, Action.ENUM.UPDATE),
  roleControllers.updateRolePermissions
);
module.exports = router;
