const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class ShiftRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.organization_shift,
    });
  }
}

 
module.exports = {
  shiftRepository: new ShiftRepository({ sequelize: db.sequelize }),
};
