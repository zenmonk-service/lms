const db = require("../models");
const { BaseRepository } = require("./base-repository");

class OrganizationRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.public.organization.schema("public"),
    });
  }

  async updateOrganization(org_uuid, body) {
    return this.model.update(body, {
      where: { uuid: org_uuid },
      returning: true,
    });
  }
    

}

module.exports = {
  organizationRepository: new OrganizationRepository({
    sequelize: db.sequelize,
  }),
};
