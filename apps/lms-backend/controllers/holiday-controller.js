const { HTTP_STATUS_CODE } = require("../lib/constants");
const { holidayService } = require("../services");

exports.getFilteredHoliday = async (req, res, next) => {
  try {
    const response = await holidayService.getFilteredHolidays(req);
    // if (!response.total) 
    //   return res.status(HTTP_STATUS_CODE.ENUM.NO_CONTENT).json({ message: "No holiday found." });
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
};

exports.createHoliday = async (req, res, next) => {
  try {
    await holidayService.createHoliday(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Holiday created successfully." });
  } catch (error) {
    next(error);
  }
};

exports.getHolidayById = async (req, res, next) => {
  try {
    const response = await holidayService.getHolidayById(req);
    if (!response) throw new NotFoundError("Holiday not found.");
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
};

exports.updateHoliday = async (req, res, next) => {
  try {
    await holidayService.updateHolidayById(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Holiday updated successfully." });
  } catch (error) {
    next(error);
  }
};

exports.createBulkHolidays = async (req, res, next) => {
  try {
    await holidayService.createBulkHolidays(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Holidays Created or updated in bulk successfully." });
  } catch (error) {
    next(error);
  }
};