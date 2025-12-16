const db = require("../models");
const { BaseRepository } = require("./base-repository");

class OrganizationRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.public.organization.schema("public"),
    });
  }
}

module.exports = {
  organizationRepository: new OrganizationRepository({
    sequelize: db.sequelize,
  }),
};
