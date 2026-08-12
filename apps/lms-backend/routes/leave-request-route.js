const router = require("express").Router();
const { leaveRequestControllers } = require("../controllers");
const { acl, validateUser } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router
  .route("/")
  .get(validateUser(), leaveRequestControllers.getFilteredLeaveRequests);

router.get(
  "/effective-days",
  acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.READ),
  leaveRequestControllers.listEffectiveDays,
);
router.get("/report", leaveRequestControllers.reportLeaveRequest);
router
  .route("/:leave_request_uuid")
  .get(leaveRequestControllers.getLeaveRequestByUUID)
  .put(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.UPDATE), leaveRequestControllers.updateLeaveRequest)
  .delete(leaveRequestControllers.deleteLeaveRequest);

router.patch(
  "/:leave_request_uuid/approve",
  validateUser(),
  leaveRequestControllers.approveLeaveRequest,
);
router.patch(
  "/:leave_request_uuid/reject",
  validateUser(),
  leaveRequestControllers.rejectLeaveRequest,
);
router.patch(
  "/:leave_request_uuid/recommend",
  validateUser(),
  leaveRequestControllers.recommendLeaveRequest,
);

module.exports = router;
