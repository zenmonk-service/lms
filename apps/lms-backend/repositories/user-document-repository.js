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

  async listUserDocuments(user_id) {
    return this.findAll(
      { user_id },
      [],
      true,
      { exclude: ["id", "user_id"] },
      undefined,
      { order: [["created_at", "DESC"]] }
    );
  }
}

module.exports = {
  userDocumentRepository: new UserDocumentRepository({
    sequelize: db.sequelize,
  }),
};
