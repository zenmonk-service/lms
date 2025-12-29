const { NotFoundError } = require("../middleware/error");
const { holidayService } = require("../services");
const { HTTP_STATUS_CODE } = require("../lib/constants");

exports.getFilteredHoliday = async (req, res, next) => {
  try {
    const response = await holidayService.getFilteredHolidays(req);
    if (!response.total)
      return res
        .status(HTTP_STATUS_CODE.ENUM.NO_CONTENT)
        .json({ message: "No holiday found." });
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
};

exports.createHoliday = async (req, res, next) => {
  try {
    const response = await holidayService.createHoliday(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json(response);
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
    const response = await holidayService.updateHolidayById(req);
    if (!response) throw new NotFoundError("Holiday not found.");
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
};

// exports.deleteHoliday = async (req, res, next) => {
//   try {
//     const response = await holidayService.deleteHoliday(req);
//     if (!response)
//       throw new NotFoundError("Holiday not found or already deleted.");
//     res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
//   } catch (error) {
//     next(error);
//   }
// };
