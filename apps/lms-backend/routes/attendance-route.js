const router = require("express").Router();
const { attendanceControllers } = require("../controllers");
const { acl, validateUser } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router
  .route("/")
  .get(acl(Permission.ENUM.ATTENDANCE_REPORT_MANAGEMENT, Action.ENUM.READ),
    attendanceControllers.getFilteredAttendance,
  )
  .post(acl(Permission.ENUM.ATTENDANCE_REPORT_MANAGEMENT, Action.ENUM.UPDATE),
    attendanceControllers.recordAttendance,
  );

router.put(
  "/:attendance_uuid",acl(Permission.ENUM.ATTENDANCE_REPORT_MANAGEMENT, Action.ENUM.UPDATE),
  attendanceControllers.updateAttendance,
);

router
  .route("/missing")
  .get(acl(Permission.ENUM.ATTENDANCE_REPORT_MANAGEMENT, Action.ENUM.UPDATE),
    attendanceControllers.getMissingAttendanceRecords,
  )
  .post(acl(Permission.ENUM.ATTENDANCE_REPORT_MANAGEMENT, Action.ENUM.CREATE_BULK),
    attendanceControllers.createMissingAttendanceRecords,
  );

router.get(
  "/report",acl(Permission.ENUM.ATTENDANCE_REPORT_MANAGEMENT, Action.ENUM.READ),
  attendanceControllers.listAttendanceReport,
);

router.get(
  "/download",acl(Permission.ENUM.ATTENDANCE_REPORT_MANAGEMENT, Action.ENUM.READ),
  attendanceControllers.downloadAttendanceReport,
);

router.post(
  "/bulk",acl(Permission.ENUM.ATTENDANCE_REPORT_MANAGEMENT, Action.ENUM.CREATE_BULK),
  attendanceControllers.bulkCreateAttendances,
);

module.exports = router;
