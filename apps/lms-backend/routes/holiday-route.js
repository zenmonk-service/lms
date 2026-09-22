const router = require("express").Router();
const { holidayControllers } = require("../controllers");
const { validateUser } = require("../middleware/acl-middleware");

router.route("/").get(validateUser(),holidayControllers.getFilteredHoliday);

module.exports = router;
