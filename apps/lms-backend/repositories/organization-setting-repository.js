const { Op } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class OrganizationSettingRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.organization_setting,
    });
  }

  getOrganizationSetting(role_uuid) {
    return this.findOne({
      role_id: role_uuid
        ? { [Op.eq]: this.getLiteralFrom("role", role_uuid) }
        : null,
    });
  }
}

module.exports = {
  organizationSettingRepository: new OrganizationSettingRepository({
    sequelize: db.sequelize,
  }),
};
