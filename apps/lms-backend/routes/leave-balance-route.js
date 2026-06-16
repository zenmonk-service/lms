const router = require("express").Router();
const { leaveBalanceControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");

router.put(
  "/:leave_balance_uuid/sla",acl(Permission.ENUM.LEAVE_BALANCE_MANAGEMENT, Action.ENUM.UPDATE),
  leaveBalanceControllers.addSlaToLeaveBalance,
);

module.exports = router;
