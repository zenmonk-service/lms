const db = require("../models");
const { BaseRepository } = require("./base-repository");

class OrganizationUserRepository extends BaseRepository {
    constructor({ sequelize }) {
      super({
      sequelize,
      modelFactory: () => db.public.organization_user.schema("public"),
    });
    }
}

module.exports = {
    organizationUserRepository: new OrganizationUserRepository({
        sequelize: db.sequelize,
        model: db.public.organization_user,
    }),
};