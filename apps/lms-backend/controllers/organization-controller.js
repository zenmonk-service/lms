const { HTTP_STATUS_CODE } = require("../lib/constants");
const { organizationService } = require("../services");

exports.getFilteredOrganization = async (req, res, next) => {
  try {
    const response = await organizationService.getFilteredOrganizations(req);
    if (!response.total)
      return res
        .status(HTTP_STATUS_CODE.ENUM.NO_CONTENT)
        .json({ message: "No organization found." });
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.createOrganization = async (req, res, next) => {
  try {
    await organizationService.createOrganization(req.body);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "Organization list successfully." });
  } catch (err) {
    next(err);
  }
};

exports.getOrganizationByUUID = async (req, res, next) => {
  try {
    const response = await organizationService.getOrganizationByUUID(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};



exports.loggedInOrganization = async (req, res, next) => {
  try {
    const response = await organizationService.loggedInOrganization(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.activateOrganization = async (req, res, next) => {
  try {
      await organizationService.activateOrganization(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Organization activated successfully." });
  } catch (err) {
      next(err);
  }
}

exports.deactivateOrganization= async (req, res, next) => {
  try {
      await organizationService.deactivateOrganization(req);
      res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Organization deactivated successfully." });
  } catch (err) {
      next(err);
  }
}
