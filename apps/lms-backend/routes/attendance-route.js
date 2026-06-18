const router = require("express").Router();
const { attendanceControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");
const upload = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .get(
    acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.READ),
    attendanceControllers.getFilteredAttendance,
  )
  .post(attendanceControllers.recordAttendance);

router.get('/report',acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.REPORT), attendanceControllers.listAttendanceReport)

router
  .route("/bulk")
  .post(acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.CREATE_BULK),upload.single("file"), attendanceControllers.bulkCreateAttendances);

module.exports = router;
