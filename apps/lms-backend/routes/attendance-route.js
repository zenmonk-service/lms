const router = require("express").Router();
const { attendanceControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router.route("/")
    .get(attendanceControllers.getFilteredAttendance)
    .post(attendanceControllers.recordAttendance)

router.route("/bulk")
    .post(attendanceControllers.bulkCreateAttendances)

module.exports = router;