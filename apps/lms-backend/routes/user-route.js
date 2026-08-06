const { userControllers } = require("../controllers");
const { acl, validateUser } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

const router = require("express").Router();

router
  .route("/")
  .post(
    acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.CREATE),
    userControllers.createUser,
  )
  .get(
    acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.READ),
    userControllers.getFilteredUsers,
  );
router
  .route("/employee-code")
  .get(
    acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.UPDATE),
    userControllers.generateEmployeeCode,
  );
router.route("/verify").post(userControllers.verifyUser);
router.route("/by-email").get(validateUser(), userControllers.getUserByEmail);
router
  .route("/:user_uuid")
  .get(
    acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.READ),
    userControllers.getUserByUuid,
  )
  .put(
    acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.UPDATE),
    userControllers.updateUser,
  );
router
  .route("/:user_uuid/notifications")
  .get(
    acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.READ),
    userControllers.getUserNotifications,
  );
router
  .route("/:user_uuid/notifications/unread-count")
  .get(
    acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.READ),
    userControllers.getUserUnreadNotificationsCount,
  );
router
  .route("/:user_id/organizations")
  .get(validateUser(), userControllers.listUserOrganizations);

router.route("/:user_uuid/password").put(userControllers.updatePassword);

router.patch(
  "/:user_uuid/activate",
  acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.ACTIVATE),
  userControllers.activateUser,
);
router.patch(
  "/:user_uuid/deactivate",
  acl(Permission.ENUM.USER_MANAGEMENT, Action.ENUM.ACTIVATE),
  userControllers.deactivateUser,
);

module.exports = router;
