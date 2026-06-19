const router = require("express").Router();
const { attendanceControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");
const uploadMiddleware = require("../middleware/multer-middleware");

router
  .route("/")
  .get(
    acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.READ),
    attendanceControllers.getFilteredAttendance,
  )
  .post(attendanceControllers.recordAttendance);

router.get('/report',acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.REPORT), attendanceControllers.listAttendanceReport)

router
  .route("/upload")
  .post( uploadMiddleware.single, attendanceControllers.bulkCreateAttendances);

module.exports = router;
