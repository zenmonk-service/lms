const router = require("express").Router();
const { payrollControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action, Permission } = require("@repo/common");


router.route("/")
    .get(payrollControllers.getFilteredPayrolls)
    .post(payrollControllers.generatePayroll);


router.get("/download",payrollControllers.downloadMonthlyPayroll);

module.exports = router;
