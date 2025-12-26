const { HTTP_STATUS_CODE } = require("../lib/constants");
const {
  userService,
  organizationService,
  leaveRequestService,
} = require("../services");

exports.createUser = async (req, res, next) => {
  try {
    await userService.createUser(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "User created successfully." });
  } catch (error) {
    next(error);
  }
};

exports.getFilteredUsers = async (req, res, next) => {
  try {
    const response = await userService.getFilteredUsers(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    await userService.updateUser(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "User Updated successfully." });
  } catch (error) {
    next(error);
  }
};

exports.listUserOrganizations = async (req, res, next) => {
  try {
    const organizations = await organizationService.listUserOrganizations(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(organizations);
  } catch (err) {
    next(err);
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const response = await userService.verifyUser(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    await userService.updatePassword(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({ message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
};

exports.getLeaveRequestsOfUser = async (req, res, next) => {
  try {
    req.query.user_uuid = req.params.user_uuid;
    const response = await leaveRequestService.getFilteredLeaveRequests(req);
    // if (!response.total)
    //   return res
    //     .status(HTTP_STATUS_CODE.ENUM.NO_CONTENT)
    //     .json({ message: "No leave requests found." });
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
};

exports.getLeaveRequestOfUser = async (req, res, next) => {
  try {
    const response = await leaveRequestService.getLeaveRequestByUUID(req);
    // if (!response) throw new NotFoundError("Leave request not found.");
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
};

exports.createLeaveRequestForUser = async (req, res, next) => {
  try {
    req.body.user_uuid = req.params.user_uuid;
    await leaveRequestService.createLeaveRequest(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "Leave request created successfully." });
  } catch (error) {
    next(error);
  }
};

exports.updateLeaveRequestOfUser = async (req, res, next) => {
  try {
    req.body.user_uuid = req.params.user_uuid;
    await leaveRequestService.updateLeaveRequest(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({ message: "Leave request updated successfully." });
  } catch (error) {
    next(error);
  }
};

exports.deleteLeaveRequestOfUser = async (req, res, next) => {
  try {
    await leaveRequestService.deleteLeaveRequest(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({ message: "Leave request deleted successfully." });
  } catch (error) {
    next(error);
  }
};

exports.getUserByEmail = async (req, res, next) => {
  try {
    const response = await userService.getUserByEmail(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
};

exports.activateUser = async (req, res, next) => {
    try {
        await userService.activateUser(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "User activated successfully." });
    } catch (err) {
        next(err);
    }
}

exports.deactivateUser = async (req, res, next) => {
    try {
        await userService.deactivateUser(req);
        res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "User deactivated successfully." });
    } catch (err) {
        next(err);
    }
}
