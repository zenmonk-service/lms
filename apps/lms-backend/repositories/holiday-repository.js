const { Op, where } = require("sequelize");
const { sequelize } = require("../config/db-connection");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class HolidayRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.public.holiday.schema("public"),
    });
  }

  async getFilteredHolidays(
    { date_observed },
    { order_type, order_column }
  ) {
    let criteria = {};
    if (date_observed) criteria.date_observed = { [Op.eq]: date_observed };
    let paranoid = true;
    const order = [[order_column, order_type]];
    const include = [];
    return this.model.findAll({ where: criteria, paranoid, order, include });
  }

  async createHoliday(payload) {
    const { name, date_observed, holiday_type, description } = payload;
    const holiday = { name, date_observed, holiday_type, description };
    return this.create(holiday);
  }

  async getHolidayById(holiday_uuid) {
    let criteria = { uuid: { [Op.eq]: holiday_uuid } };
    return await this.findOne(criteria);
  }

  async updateHolidayById(holiday_uuid, payload) {
    const criteria = { uuid: { [Op.eq]: holiday_uuid } };
    const holiday = {
      name: payload.name,
      date_observed: payload.date_observed,
      holiday_type: payload.holiday_type,
      description: payload.description,
    };
    return this.update(criteria, holiday);
  }
}

module.exports = {
  holidayRepository: new HolidayRepository({
    sequelize: db.sequelize,
  }),
};
