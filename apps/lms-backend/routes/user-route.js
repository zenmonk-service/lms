const { userControllers } = require("../controllers");
const { acl, validateUser } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

const router = require("express").Router();

router
  .route("/")
  .post(
    userControllers.createUser,
  )
  .get(
    userControllers.getFilteredUsers,
  );
router
  .route("/employee-code")
  .get(
    userControllers.generateEmployeeCode,
  );
router.route("/verify").post(userControllers.verifyUser);
router.route("/by-email").get( userControllers.getUserByEmail);
router
  .route("/:user_uuid")
  .get(
    userControllers.getUserByUuid,
  )
  .put(
    userControllers.updateUser,
  );
router
  .route("/:user_uuid/notifications")
  .get(
    userControllers.getUserNotifications,
  );
router
  .route("/:user_uuid/notifications/unread-count")
  .get(
    userControllers.getUserUnreadNotificationsCount,
  );
router
  .route("/:user_id/organizations")
  .get( userControllers.listUserOrganizations);

router.route("/:user_uuid/password").put(userControllers.updatePassword);

router.patch(
  "/:user_uuid/activate",
  userControllers.activateUser,
);
router.patch(
  "/:user_uuid/deactivate",
  userControllers.deactivateUser,
);

module.exports = router;
