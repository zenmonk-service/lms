const router = require("express").Router();
const { leaveTypeControllers } = require("../controllers");

router
  .route("/")
  .get(leaveTypeControllers.getFilteredLeaveTypes)
  .post(leaveTypeControllers.createLeaveType);

router
  .route("/:leave_type_uuid")
  .get(leaveTypeControllers.getLeaveTypeById)
  .put(leaveTypeControllers.updateLeaveTypeById);

router.patch(
  "/:leave_type_uuid/activate",
  leaveTypeControllers.activateLeaveType
);

router.patch(
  "/:leave_type_uuid/deactivate",
  leaveTypeControllers.deactivateLeaveType
);

module.exports = router;
