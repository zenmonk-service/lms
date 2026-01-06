const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class ShiftRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.organization_shift.schema(getSchema()),
    });
  }

  async listShifts() {
    return this.model.findAll();
  }

  async createShift(shiftData) {
    return this.model.create(shiftData);
  }

  async updateShift(uuid, shiftData) {
    return this.model.update(shiftData, {
      where: { uuid },
    });
  }

  async deleteShift(uuid) {
    return this.model.destroy({
      where: { uuid },
    });
  }
}

module.exports = {
  shiftRepository: new ShiftRepository({ sequelize: db.sequelize }),
};
