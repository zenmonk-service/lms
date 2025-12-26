const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { getSchema } = require("../lib/schema");

class OrganizationSettingRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.organization_setting.schema(getSchema()),
    });
  }

  async getOrganizationSetting() {
    return await this.model.findOne();
  }

  async createOrganizationSetting(organizationSettingData) {
    return await this.model.create(organizationSettingData);
  }

  async updateOrganizationSetting(organizationSettingData) {
    const setting = await this.model.findOne();
    return await this.model.update(organizationSettingData, {
      where: { id: setting.id },
      returning: true,
    });
  }
}

module.exports = {
  organizationSettingRepository: new OrganizationSettingRepository({
    sequelize: db.sequelize,
  }),
};
