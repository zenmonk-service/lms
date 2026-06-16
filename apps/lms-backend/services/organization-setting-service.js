const {
  organizationSettingRepository,
} = require("../repositories/organization-setting-repository");

exports.updateOrganizationSetting = async (payload) => {
  const organizationSettingData = payload.body;
  return await organizationSettingRepository.updateOrganizationSetting(
    organizationSettingData,
  );
};

exports.getOrganizationSetting = async () => {
  return await organizationSettingRepository.findOne();
};

exports.createOrganizationSetting = async (payload) => {
  const organizationSettingData = payload.body;
  return await organizationSettingRepository.createOrganizationSetting(
    organizationSettingData,
  );
};
