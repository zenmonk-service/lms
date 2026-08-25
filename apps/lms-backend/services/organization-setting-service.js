const {
  organizationSettingRepository,
} = require("../repositories/organization-setting-repository");

exports.updateOrganizationSetting = async (payload) => {
  const settings = await organizationSettingRepository.findOne({
    role_id: null,
  });

  return await organizationSettingRepository.update(
    { id: settings.id },
    payload.body,
  );
};

exports.getOrganizationSetting = async (payload) => {
  const { role_uuid = null } = payload.query;
  return await organizationSettingRepository.getOrganizationSetting(role_uuid);
};

exports.createOrganizationSetting = async (payload) => {
  return await organizationSettingRepository.create(payload.body);
};
