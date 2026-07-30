const router = require("express").Router();
const { holidayControllers } = require("../controllers");

router.route("/").get(holidayControllers.getFilteredHoliday);

module.exports = router;
