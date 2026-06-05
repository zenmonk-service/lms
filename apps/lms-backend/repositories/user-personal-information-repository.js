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

  _getAssociation() {
    const include = [
      {
        association: "documents",
        model: db.tenants.user_document.schema(getSchema()),
      },
    ];
    return include;
  }
}

module.exports = {
  userPersonalInformationRepository: new UserPersonalInformationRepository({
    sequelize: db.sequelize,
  }),
};
