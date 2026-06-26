const db = require("../models");
const { BaseRepository } = require("./base-repository");

class UserDocumentRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.user_document,
    });
  }
}

module.exports = {
  userDocumentRepository: new UserDocumentRepository({
    sequelize: db.sequelize,
  }),
};
