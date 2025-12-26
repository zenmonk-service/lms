const router = require("express").Router();
const { attendanceControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router.route("/")
    .get(acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.READ),attendanceControllers.getFilteredAttendance)
    .post(acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.CREATE),attendanceControllers.recordAttendance)

router.route("/bulk")
    .post(acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.CREATE_BULK),attendanceControllers.bulkCreateAttendances)

module.exports = router;