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
  .post(validateUser(),
    attendanceControllers.recordAttendance,
  );

router.put(
  "/:attendance_uuid",validateUser(),
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
  "/bulk",validateUser(),
  attendanceControllers.bulkCreateAttendances,
);

module.exports = router;
