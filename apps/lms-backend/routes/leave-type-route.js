const router = require("express").Router();
const { leaveTypeControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router
  .route("/")
  .get(acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.READ),leaveTypeControllers.getFilteredLeaveTypes)
  .post(acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.CREATE),leaveTypeControllers.createLeaveType);

router
  .get("/user/:user_uuid/balances",acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.READ),leaveTypeControllers.getUserLeaveBalances);

router
  .route("/:leave_type_uuid")
  .get(acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.READ),leaveTypeControllers.getLeaveTypeById)
  .put(acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.UPDATE),leaveTypeControllers.updateLeaveTypeById);

  router
  .route("/:leave_type_uuid/sla")
  .put(acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.UPDATE),leaveTypeControllers.addSlaToLeaveBalance);

router.patch(
  "/:leave_type_uuid/activate",acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.ACTIVATE),
  leaveTypeControllers.activateLeaveType
);

router.patch(
  "/:leave_type_uuid/deactivate",acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.ACTIVATE),
  leaveTypeControllers.deactivateLeaveType
);

module.exports = router;
