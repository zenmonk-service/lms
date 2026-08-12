const router = require("express").Router();
const { leaveRequestControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router
  .route("/")
  .get(
    leaveRequestControllers.getFilteredLeaveRequests,
  );

router.get(
  "/effective-days",
  leaveRequestControllers.listEffectiveDays,
);
router.get("/report", leaveRequestControllers.reportLeaveRequest);
router
  .route("/:leave_request_uuid")
  .get(
    leaveRequestControllers.getLeaveRequestByUUID,
  )
  .put(
    leaveRequestControllers.updateLeaveRequest,
  )
  .delete(
    leaveRequestControllers.deleteLeaveRequest,
  );

router.patch(
  "/:leave_request_uuid/approve",
  leaveRequestControllers.approveLeaveRequest,
);
router.patch(
  "/:leave_request_uuid/reject",
  leaveRequestControllers.rejectLeaveRequest,
);
router.patch(
  "/:leave_request_uuid/recommend",
  leaveRequestControllers.recommendLeaveRequest,
);

module.exports = router;
