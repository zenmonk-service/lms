const router = require("express").Router();
const { leaveRequestControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");


router.route("/").get(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.READ),leaveRequestControllers.getFilteredLeaveRequests);

router.get("/effective-days",acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.READ), leaveRequestControllers.listEffectiveDays);

router
  .route("/:leave_request_uuid")
  .get(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.READ),leaveRequestControllers.getLeaveRequestByUUID)
  .put(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.UPDATE),leaveRequestControllers.updateLeaveRequest)
.delete(acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.DELETE),leaveRequestControllers.deleteLeaveRequest)

router.patch(
  "/:leave_request_uuid/approve",acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.APPROVE),
  leaveRequestControllers.approveLeaveRequest
);
router.patch(
  "/:leave_request_uuid/reject",acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.APPROVE),
  leaveRequestControllers.rejectLeaveRequest
);
router.patch(
  "/:leave_request_uuid/recommend",acl(Permission.ENUM.LEAVE_REQUEST_MANAGEMENT, Action.ENUM.APPROVE),
  leaveRequestControllers.recommendLeaveRequest
);

module.exports = router;
