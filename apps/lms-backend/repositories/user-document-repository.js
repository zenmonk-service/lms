const db = require("../models");
const { getSchema } = require("../lib/schema");
const { BaseRepository } = require("./base-repository");

class UserDocumentRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.user_document.schema(getSchema()),
    });
  }
}

module.exports = {
  userDocumentRepository: new UserDocumentRepository({
    sequelize: db.sequelize,
  }),
};
