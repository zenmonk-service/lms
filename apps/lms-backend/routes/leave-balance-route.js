const router = require("express").Router();
const { leaveBalanceControllers } = require("../controllers");

router.put(
  "/:leave_balance_uuid/sla",
  leaveBalanceControllers.addSlaToLeaveBalance,
);

module.exports = router;
