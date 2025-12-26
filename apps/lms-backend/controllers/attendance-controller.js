const { HTTP_STATUS_CODE } = require("../lib/constants");
const { attendanceService } = require("../services");

exports.recordAttendance = async (req, res, next) => {
    try {
        await attendanceService.recordAttendance(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Attendance recorded successfully." });
    } catch (err) {
        next(err);
    }
};

exports.getFilteredAttendance = async (req, res, next) => {
    try {
        const response = await attendanceService.getFilteredAttendance(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (err) {
        next(err);
    }
};

exports.bulkCreateAttendances = async (req, res, next) => {
    try {
        const response = await attendanceService.bulkCreateAttendances(req);
        res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Attendance records created successfully." });
    } catch (err) {
        next(err);
    }
};
