const { queryService } = require("../services");
const { HTTP_STATUS_CODE } = require("../lib/constants");

exports.createQuery = async (req, res, next) => {
  try {
    await queryService.createQuery(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Query created successfully." });
  } catch (err) {
    next(err);

  }
};

exports.getFilteredQueries = async (req, res, next) => {
  try {
    const response = await queryService.getFilteredQueries(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.getQueryById = async (req, res, next) => {
  try {
    const response = await queryService.getQueryById(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.updateQuery = async (req, res, next) => {
  try {
    await queryService.updateQuery(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Query updated successfully." });
  } catch (err) {
    next(err);
  }
};

exports.changeQueryStatus = async (req, res, next) => {
  try {
    await queryService.changeQueryStatus(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Query status changed successfully." });
  } catch (err) {
    next(err);
  }
};

exports.deleteQuery = async (req, res, next) => {
  try {
    const response = await queryService.deleteQuery(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.createQueryMessage = async (req, res, next) => {
  try {
    await queryService.createQueryMessage(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Query message created successfully." });
  } catch (err) {
    next(err);
  }
};

exports.updateQueryMessage = async (req, res, next) => {
  try {
    const response = await queryService.updateQueryMessage(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.deleteQueryMessage = async (req, res, next) => {
  try {
    const response = await queryService.deleteQueryMessage(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.getQueryMessages = async (req, res, next) => {
  try {
    const response = await queryService.getQueryMessages(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.addAttachment = async (req, res, next) => {
  try {
    const response = await queryService.addAttachment(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

exports.removeAttachment = async (req, res, next) => {
  try {
    const response = await queryService.removeAttachment(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const response = await queryService.addMember(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const response = await queryService.removeMember(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.getQueryMembers = async (req, res, next) => {
  try {
    const response = await queryService.getQueryMembers(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

