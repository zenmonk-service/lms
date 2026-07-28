const router = require("express").Router();
const { payrollControllers } = require("../controllers");


router.route("/")
    .get(payrollControllers.getFilteredPayrolls)
    .post(payrollControllers.generatePayroll);

router.route("/:payroll_id")
    .post(payrollControllers.generatePayroll);

module.exports = router;
