const router = require("express").Router();
const { holidayControllers } = require("../controllers");

router
  .route("/")
  .get(holidayControllers.getFilteredHoliday)
  .post(holidayControllers.createHoliday);

router
  .route("/:holiday_uuid")
  .get(holidayControllers.getHolidayById)
  .put(holidayControllers.updateHoliday);

module.exports = router;
