const router = require("express").Router();
const { attendanceControllers } = require("../controllers");
const { acl, validateUser } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router
  .route("/")
  .get(validateUser(),
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
  .get(validateUser(),
    attendanceControllers.getMissingAttendanceRecords,
  )
  .post(validateUser(),
    attendanceControllers.createMissingAttendanceRecords,
  );

router.get(
  "/report",
  attendanceControllers.listAttendanceReport,
);

router.get(
  "/download",validateUser(),
  attendanceControllers.downloadAttendanceReport,
);

router.post(
  "/bulk",acl(Permission.ENUM.ATTENDANCE_REPORT_MANAGEMENT, Action.ENUM.CREATE_BULK),
  attendanceControllers.bulkCreateAttendances,
);

module.exports = router;
