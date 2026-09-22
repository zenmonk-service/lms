const router = require("express").Router();
const { payrollControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action, Permission } = require("@repo/common");


router.route("/")
    .get(acl(Permission.ENUM.PAYROLL_MANAGEMENT, Action.ENUM.READ),payrollControllers.getFilteredPayrolls)
    .post(acl(Permission.ENUM.PAYROLL_MANAGEMENT, Action.ENUM.CREATE),payrollControllers.generatePayroll);


router.get("/download",acl(Permission.ENUM.PAYROLL_MANAGEMENT, Action.ENUM.REPORT),payrollControllers.downloadMonthlyPayroll);

module.exports = router;
