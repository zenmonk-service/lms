const { userControllers } = require("../controllers");

const router = require("express").Router();


router.patch("/:user_uuid/check-in", userControllers.recordUserCheckIn);
router.patch("/:user_uuid/check-out", userControllers.recordUserCheckOut);
router.get("/:user_uuid/attendances", userControllers.getUserAttendance);
// router.get("/:user_uuid/attendance-report", userControllers.getAttendanceReportOfUser);

module.exports = router;