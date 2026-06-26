const db = require("../models");
const { BaseRepository } = require("./base-repository");

class PublicUserRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.public.user.schema("public"),
      useTenantSchema: false
    });
  }

  getLiteralFrom(table, value, column = "uuid") {
    return this.sequelize.literal(
      `(SELECT id FROM "public"."${table}" WHERE ${column}='${value}')`,
    );
  }
}

module.exports = {
  publicUserRepository: new PublicUserRepository({
    sequelize: db.sequelize,
    model: db.public.user,
  }),
};
