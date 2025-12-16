const router = require("express").Router();
const { roleControllers } = require("../controllers");

router
  .route("/")
  .get(roleControllers.getFilteredRoles)
  .post(roleControllers.createRole);

router
  .route("/:role_uuid")
  .get(roleControllers.getRoleById)
  .put(roleControllers.updateRole);

router.put(
  "/:role_uuid/permissions",
  roleControllers.updateRolePermissions
);
module.exports = router;
