const { HTTP_STATUS_CODE } = require("../lib/constants");
const { attendanceService } = require("../services");

exports.recordAttendance = async (req, res, next) => {
  try {
    await attendanceService.recordAttendance(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({ message: "Attendance recorded successfully." });
  } catch (err) {
    next(err);
  }
};

exports.getFilteredAttendance = async (req, res, next) => {
  try {
    const response = await attendanceService.getFilteredAttendance(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    console.log("err: ", err);
    next(err);
  }
};

exports.getMissingAttendanceRecords = async (req, res, next) => {
    try {
        const response = await attendanceService.getMissingAttendanceRecords(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (err) {
        next(err);
    }
};

exports.createMissingAttendanceRecords = async (req, res, next) => {
    try {
        const response = await attendanceService.createMissingAttendanceRecords(req);
        res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: 'Missing Attendance Records created successfully.' });
    } catch (err) {
        next(err);
    }
}

exports.bulkCreateAttendances = async (req, res, next) => {
  try {
    await attendanceService.bulkCreateAttendanceWithExcel(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "Uploaded Excel Sheet successfully." });
  } catch (err) {
    next(err);
  }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    await attendanceService.updateAttendance(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "Attendance Updated successfully." });
  } catch (err) {
    next(err);
  }
};

exports.listAttendanceReport = async (req, res, next) => {
    try {
        const response = await attendanceService.listAttendanceReport(req);
        res.status(HTTP_STATUS_CODE.ENUM.CREATED).json(response);
    } catch (err) {        
        next(err);
    }
};

exports.downloadAttendanceReport = async (req, res, next) => {
  try {
    const { filename, buffer } =
      await attendanceService.downloadAttendanceReport(req);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.send(buffer);
  } catch (err) {
    next(err);
  }
};
