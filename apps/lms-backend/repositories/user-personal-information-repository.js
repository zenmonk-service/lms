const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class UserPersonalInformationRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () =>
        db.tenants.user_personal_information.schema(getSchema()),
    });
  }
}

module.exports = {
  userPersonalInformationRepository: new UserPersonalInformationRepository({
    sequelize: db.sequelize,
  }),
};
