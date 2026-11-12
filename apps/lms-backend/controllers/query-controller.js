const { queryService } = require("../services");
const { NotFoundError } = require("../middleware/error");
const { HTTP_STATUS_CODE } = require("../lib/constants");

/* --------------------------------- Queries -------------------------------- */

exports.getFilteredQueries = async (req, res, next) => {
  try {
    const response = await queryService.getFilteredQueries(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.getQueryByUUID = async (req, res, next) => {
  try {
    const response = await queryService.getQueryByUUID(req);
    if (!response) throw new NotFoundError("Query not found.");
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.createQuery = async (req, res, next) => {
  try {
    await queryService.createQuery(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "Query created successfully." });
  } catch (err) {
    next(err);
  }
};

exports.updateQuery = async (req, res, next) => {
  try {
    await queryService.updateQuery(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({ message: "Query updated successfully." });
  } catch (err) {
    next(err);
  }
};

exports.changeQueryStatus = async (req, res, next) => {
  try {
    const response = await queryService.changeQueryStatus(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({ message: "Query status changed successfully.", data: response });
  } catch (err) {
    next(err);
  }
};

exports.deleteQuery = async (req, res, next) => {
  try {
    await queryService.deleteQuery(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({ message: "Query deleted successfully." });
  } catch (err) {
    next(err);
  }
};

/* -------------------------------- Messages -------------------------------- */

exports.getQueryMessages = async (req, res, next) => {
  try {
    const response = await queryService.getQueryMessages(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.createQueryMessage = async (req, res, next) => {
  try {
    const response = await queryService.createQueryMessage(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "Query message created successfully.", data: response });
  } catch (err) {
    next(err);
  }
};

exports.updateQueryMessage = async (req, res, next) => {
  try {
    const response = await queryService.updateQueryMessage(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({ message: "Query message updated successfully.", data: response });
  } catch (err) {
    next(err);
  }
};

exports.deleteQueryMessage = async (req, res, next) => {
  try {
    const response = await queryService.deleteQueryMessage(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({ message: "Query message deleted successfully.", data: response });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------- Attachments ------------------------------ */

exports.addAttachment = async (req, res, next) => {
  try {
    const response = await queryService.addAttachment(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "Attachment added successfully.", data: response });
  } catch (err) {
    next(err);
  }
};

exports.removeAttachment = async (req, res, next) => {
  try {
    await queryService.removeAttachment(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({ message: "Attachment removed from query message successfully." });
  } catch (err) {
    next(err);
  }
};

/* --------------------------------- Members -------------------------------- */

exports.getQueryMembers = async (req, res, next) => {
  try {
    const response = await queryService.getQueryMembers(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const response = await queryService.addMember(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "Members added successfully.", data: response });
  } catch (err) {
    next(err);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const response = await queryService.removeMember(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({
        message: "Member removed from query successfully.",
        data: response,
      });
  } catch (err) {
    next(err);
  }
};
