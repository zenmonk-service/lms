const { leaveRequestService } = require("../services");
const { NotFoundError } = require("../middleware/error");
const { HTTP_STATUS_CODE } = require("../lib/constants");

exports.getFilteredLeaveRequests = async (req, res, next) => {
    try {
        const response = await leaveRequestService.getFilteredLeaveRequests(req);
        // if (!response.total) return res.status(HTTP_STATUS_CODE.ENUM.NO_CONTENT).json({ message: "No leave requests found." });
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (err) {
        next(err);
    }
};

exports.getLeaveRequestByUUID = async (req, res, next) => {
    try {
        const response = await leaveRequestService.getLeaveRequestByUUID(req);
        if (!response) throw new NotFoundError("Leave request not found.");
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (err) {
        next(err);
    }
};

exports.updateLeaveRequest = async (req, res, next) => {
    try {
        await leaveRequestService.updateLeaveRequest(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Leave request updated successfully." });
    } catch (err) {
        next(err);
    }
};

exports.approveLeaveRequest = async (req, res, next) => {
    try {
        await leaveRequestService.approveLeaveRequest(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Leave request approved successfully." });
    } catch (err) {
        next(err);
    }
};

exports.recommendLeaveRequest = async (req, res, next) => {
    try {
        await leaveRequestService.recommendLeaveRequest(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Leave request recommended successfully." });
    } catch (err) {
        next(err);
    }
};

exports.rejectLeaveRequest = async (req, res, next) => {
    try {
        await leaveRequestService.rejectLeaveRequest(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Leave request rejected successfully." });
    } catch (err) {
        next(err);
    }
};

exports.deleteLeaveRequest = async (req, res, next) => {
    try {
        await leaveRequestService.deleteLeaveRequest(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Leave request deleted successfully." });
    } catch (err) {
        next(err);
    }
};
