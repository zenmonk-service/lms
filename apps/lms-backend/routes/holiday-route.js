const router = require("express").Router();
const { holidayControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router
  .route("/")
  .get(acl(Permission.ENUM.HOLIDAY_MANAGEMENT, Action.ENUM.READ),holidayControllers.getFilteredHoliday)
  .post(acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.CREATE),holidayControllers.createHoliday);

router
  .route("/:holiday_uuid")
  .get(acl(Permission.ENUM.HOLIDAY_MANAGEMENT, Action.ENUM.READ),holidayControllers.getHolidayById)
  .put(acl(Permission.ENUM.HOLIDAY_MANAGEMENT, Action.ENUM.UPDATE),holidayControllers.updateHoliday);

module.exports = router;
