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

exports.updateOrganization = async (req, res, next) => {
  try {
    await organizationService.updateOrganization(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "Organization updated successfully." });
  } catch (err) {
    next(err);
  }
}

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

exports.getOrganizationEvents = async (req, res, next) => {
  try {
    const response = await organizationService.getFilteredOrganizationEvents(req);
    if (!response)
      throw new NotFoundError("Organization Events not found.");
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
}

exports.addOrganizationEvent = async (req, res, next) => {
  try {
    await organizationService.addOrganizationEvent(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Organization Event added successfully." });
  } catch (error) {
    next(error);
  }
}

exports.updateOrganizationEvent = async (req, res, next) => {
  try {
    await organizationService.updateOrganizationEvent(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Organization Event updated successfully." });
  } catch (error) {
    next(error);
  }
}

exports.deleteOrganizationEvent = async (req, res, next) => {
  try {
    await organizationService.deleteOrganizationEvent(req);
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Organization Event deleted successfully." });
  } catch (error) {
    next(error);
  }
}


exports.listOrganizationShifts = async (req, res, next) => {
  try {
    const response = await organizationService.listOrganizationShifts(req);
    if (!response)
      return res
        .status(HTTP_STATUS_CODE.ENUM.NO_CONTENT)
        .json({ message: "No organization shifts found." });
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
}