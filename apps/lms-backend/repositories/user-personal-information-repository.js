const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class UserPersonalInformationRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.user_personal_information.schema(getSchema()),
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

  async findByUserId(userId) {
    return this.model.findOne({
      where: { user_id: userId },
    });
  }

  async findByUserIdWithDocuments(userId) {
    return this.model.findOne({
      where: { user_id: userId },
      include: this._getAssociation(),
    });
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(criteria, data) {
    return this.model.update(data, { where: criteria });
  }

  async delete(criteria) {
    return this.model.destroy({ where: criteria });
  }
}

module.exports = { userPersonalInformationRepository: new UserPersonalInformationRepository({ sequelize: require("../config/db-connection").sequelize }) };
