const db = require("../models");
const { BaseRepository } = require("./base-repository");

class OrganizationSettingRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.organization_setting,
    });
  }
}

module.exports = {
  organizationSettingRepository: new OrganizationSettingRepository({
    sequelize: db.sequelize,
  }),
};
