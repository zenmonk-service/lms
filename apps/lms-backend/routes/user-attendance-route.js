const { userControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action, Permission } = require("@repo/common");

const router = require("express").Router();

router.patch(
  "/:user_uuid/check-in",
  acl(Permission.ENUM.USER_ATTENDANCE_MANAGEMENT, Action.ENUM.UPDATE),
  userControllers.recordUserCheckIn,
);
router.patch(
  "/:user_uuid/check-out",
  acl(Permission.ENUM.USER_ATTENDANCE_MANAGEMENT, Action.ENUM.UPDATE),
  userControllers.recordUserCheckOut,
);
router.get(
  "/:user_uuid/attendances",
  acl(Permission.ENUM.USER_ATTENDANCE_MANAGEMENT, Action.ENUM.READ),
  userControllers.getUserAttendance,
);

module.exports = router;
