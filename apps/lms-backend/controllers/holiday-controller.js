const { HTTP_STATUS_CODE } = require("../lib/constants");
const { holidayService } = require("../services");

exports.getFilteredHoliday = async (req, res, next) => {
  try {
    const response = await holidayService.getFilteredHolidays(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
};