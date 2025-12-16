const { HTTP_STATUS_CODE } = require("../lib/constants");
const { NotFoundError } = require("../middleware/error");
const { leaveTypeService } = require("../services");

exports.createLeaveType = async (req, res, next) => {
    try {
        await leaveTypeService.createLeaveType(req);
        res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Leave type created successfully." });
    } catch (err) {
        next(err);
    }
};

exports.getFilteredLeaveTypes = async (req, res, next) => {
    try {
        const response = await leaveTypeService.getFilteredLeaveTypes(req);
        // if (!response.total) {
        //     return res.status(HTTP_STATUS_CODE.ENUM.NO_CONTENT).json({ message: "No leave type found." });
        // }
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (err) {
        next(err);
    }
};

exports.getLeaveTypeById = async (req, res, next) => {
    try {
        const response = await leaveTypeService.getLeaveTypeById(req);
        if (!response) throw new NotFoundError("Leave Type not found.");
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (err) {
        next(err);
    }
};

exports.updateLeaveTypeById = async (req, res, next) => {
    try {
        await leaveTypeService.updateLeaveTypeById(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Leave type updated successfully." });
    } catch (err) {
        next(err);
    }
};

exports.activateLeaveType = async (req, res, next) => {
  try {
      await leaveTypeService.activateLeaveType(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Leave Type activated successfully." });
  } catch (err) {
      next(err);
  }
}

exports.deactivateLeaveType= async (req, res, next) => {
  try {
      await leaveTypeService.deactivateLeaveType(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Leave Type deactivated successfully." });
  } catch (err) {
      next(err);
  }
}
