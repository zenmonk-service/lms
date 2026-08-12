const router = require("express").Router();
const { attendanceControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router
  .route("/")
  .get(
    attendanceControllers.getFilteredAttendance,
  )
  .post(
    attendanceControllers.recordAttendance,
  );

router.put(
  "/:attendance_uuid",
  attendanceControllers.updateAttendance,
);

router
  .route("/missing")
  .get(
    attendanceControllers.getMissingAttendanceRecords,
  )
  .post(
    attendanceControllers.createMissingAttendanceRecords,
  );

router.get(
  "/report",
  attendanceControllers.listAttendanceReport,
);

router.get(
  "/download",
  attendanceControllers.downloadAttendanceReport,
);

router.post(
  "/bulk",
  attendanceControllers.bulkCreateAttendances,
);

module.exports = router;
