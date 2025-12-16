const db = require("../models");
const { BaseRepository } = require("./base-repository");

class PublicUserRepository extends BaseRepository {
    constructor({ sequelize }) {
      super({
      sequelize,
      modelFactory: () => db.public.user.schema("public"),
    });
    }
}

module.exports = {
    publicUserRepository: new PublicUserRepository({
        sequelize: db.sequelize,
        model: db.public.user,
    }),
};