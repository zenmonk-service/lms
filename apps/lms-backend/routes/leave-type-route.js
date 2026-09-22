const router = require("express").Router();
const { leaveTypeControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action, Permission } = require("@repo/common");

router
  .route("/")
  .get(
    acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.READ),
    leaveTypeControllers.getFilteredLeaveTypes,
  )
  .post(
    acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.CREATE),
    leaveTypeControllers.createLeaveType,
  );

router
  .route("/report")
  .get(
    acl(Permission.ENUM.LEAVE_REPORT_MANAGEMENT, Action.ENUM.READ),
    leaveTypeControllers.getUserLeaveReport,
  )

router
  .get(
    "/user/:user_uuid/balances",
    acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.READ),
    leaveTypeControllers.getUserLeaveBalances,
  )
  .put(
    "/user/:user_uuid/balances",
    acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.UPDATE),
    leaveTypeControllers.updateLeaveBalance,
  );

router
  .route("/:leave_type_uuid")
  .get(
    acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.READ),
    leaveTypeControllers.getLeaveTypeById,
  )
  .put(
    acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.UPDATE),
    leaveTypeControllers.updateLeaveTypeById,
  );

router
  .route("/:leave_type_uuid/sla")
  .put(
    acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.SLA),
    leaveTypeControllers.addSlaToLeaveBalance,
  );

router
  .route("/:leave_type_uuid/balance")
  .get(
    acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.UPDATE),
    leaveTypeControllers.getLeaveBalance,
  );

router.patch(
  "/:leave_type_uuid/activate",
  acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.ACTIVATE),
  leaveTypeControllers.activateLeaveType,
);

router.patch(
  "/:leave_type_uuid/deactivate",
  acl(Permission.ENUM.LEAVE_TYPE_MANAGEMENT, Action.ENUM.ACTIVATE),
  leaveTypeControllers.deactivateLeaveType,
);

module.exports = router;
