const db = require("../models");
const { BaseRepository } = require("./base-repository");

class UserDocumentRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.user_document,
    });
  }

  async bulkUserDocuments(payload, transaction) {
    const include = [{
      association: this.model.attachment,
      model: this.tenant(db.tenants.attachment),
      as: "attachments",
    }];

    return this.model.bulkCreate(payload, {
      include,
      transaction,
    });
  }
}

module.exports = {
  userDocumentRepository: new UserDocumentRepository({
    sequelize: db.sequelize,
  }),
};
