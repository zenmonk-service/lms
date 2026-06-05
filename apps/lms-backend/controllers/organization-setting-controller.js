const { HTTP_STATUS_CODE } = require("../lib/constants");
const { organizationSettingService } = require("../services");

exports.updateOrganizationSetting = async (req, res, next) => {
  try {
    const response = await organizationSettingService.updateOrganizationSetting(
      req
    );
    if (!response)
      return res
        .status(HTTP_STATUS_CODE.ENUM.NO_CONTENT)
        .json({ message: "No organization found." });
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.getOrganizationSetting = async (req, res, next) => {
  try {
    const response = await organizationSettingService.getOrganizationSetting();
    if (!response)
      return res
        .status(HTTP_STATUS_CODE.ENUM.NO_CONTENT)
        .json({ message: "No organization found." });
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (err) {
    next(err);
  }
};

exports.createOrganizationSetting = async (req, res, next) => {
  try {
    const response = await organizationSettingService.createOrganizationSetting(
      req
    );
    if (!response)
      return res
        .status(HTTP_STATUS_CODE.ENUM.NO_CONTENT)
        .json({ message: "Organization setting could not be created." });
    res.status(HTTP_STATUS_CODE.ENUM.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};
