const {
  organizationSettingRepository,
} = require("../repositories/organization-setting-repository");

exports.updateOrganizationSetting = async (payload) => {
  try {
    const organizationSettingData = payload.body;
    return await organizationSettingRepository.updateOrganizationSetting(
      organizationSettingData
    );
  } catch (err) {
    throw new Error(err);
  }
};

exports.getOrganizationSetting = async () => {
  try {
    return await organizationSettingRepository.getOrganizationSetting();
  } catch (err) {
    throw new Error(err);
  }
};

exports.createOrganizationSetting = async (payload) => {
  try {
    const organizationSettingData = payload.body;
    return await organizationSettingRepository.createOrganizationSetting(
      organizationSettingData
    );
  } catch (err) {
    throw new Error(err);
  }
};
