const router = require("express").Router();
const { leaveRequestControllers } = require("../controllers");


router.route("/").get(leaveRequestControllers.getFilteredLeaveRequests);

router
  .route("/:leave_request_uuid")
  .get(leaveRequestControllers.getLeaveRequestByUUID)
  .put(leaveRequestControllers.updateLeaveRequest)
.delete(leaveRequestControllers.deleteLeaveRequest)

router.patch(
  "/:leave_request_uuid/approve",
  leaveRequestControllers.approveLeaveRequest
);
router.patch(
  "/:leave_request_uuid/reject",
  leaveRequestControllers.rejectLeaveRequest
);
router.patch(
  "/:leave_request_uuid/recommend",
  leaveRequestControllers.recommendLeaveRequest
);

module.exports = router;
