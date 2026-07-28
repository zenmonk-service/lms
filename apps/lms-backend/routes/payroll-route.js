const router = require("express").Router();
const { payrollControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action } = require("../models/common/action-enum");
const { Permission } = require("../models/common/permission-enum");


router.route("/")
    .get(acl(Permission.ENUM.PAYROLL_MANAGEMENT, Action.ENUM.READ),payrollControllers.getFilteredPayrolls)
    .post(acl(Permission.ENUM.PAYROLL_MANAGEMENT, Action.ENUM.CREATE),payrollControllers.generatePayroll);


router.get("/download",acl(Permission.ENUM.PAYROLL_MANAGEMENT, Action.ENUM.REPORT), payrollControllers.downloadMonthlyPayroll);

router.route("/:payroll_id")
    .post(payrollControllers.generatePayroll);

module.exports = router;
