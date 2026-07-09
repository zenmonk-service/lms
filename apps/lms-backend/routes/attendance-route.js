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

router.put(
  "/:attendance_uuid",
  acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.UPDATE),
  attendanceControllers.updateAttendance,
);

router
  .route("/missing")
  .get(
    acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.REPORT),
    attendanceControllers.getMissingAttendanceRecords,
  )
  .post(
    acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.UPDATE),
    attendanceControllers.createMissingAttendanceRecords,
  );

router.get(
  "/report",
  acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.REPORT),
  attendanceControllers.listAttendanceReport,
);

router.get(
  "/download",
  acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.REPORT),
  attendanceControllers.downloadAttendanceReport,
);

router.post(
  "/upload",
  acl(Permission.ENUM.ATTENDANCE_MANAGEMENT, Action.ENUM.CREATE_BULK),
  uploadMiddleware.single,
  attendanceControllers.bulkCreateAttendances,
);

module.exports = router;
