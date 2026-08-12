const router = require("express").Router();
const { leaveTypeControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router
  .route("/")
  .get(leaveTypeControllers.getFilteredLeaveTypes)
  .post(acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.CREATE),leaveTypeControllers.createLeaveType);

router
  .get("/user/:user_uuid/balances",leaveTypeControllers.getUserLeaveBalances);

router
  .route("/:leave_type_uuid")
  .get(leaveTypeControllers.getLeaveTypeById)
  .put(leaveTypeControllers.updateLeaveTypeById);

  router
  .route("/:leave_type_uuid/sla")
  .put(leaveTypeControllers.addSlaToLeaveBalance);

router.patch(
  "/:leave_type_uuid/activate",
  leaveTypeControllers.activateLeaveType
);

router.patch(
  "/:leave_type_uuid/deactivate",
  leaveTypeControllers.deactivateLeaveType
);

module.exports = router;
