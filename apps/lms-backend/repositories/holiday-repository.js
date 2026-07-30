const { Op } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class HolidayRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.public.holiday.schema("public"),
      useTenantSchema: false,
    });
  }

  async getFilteredHolidays({ start_date, end_date, year }) {
    const criteria = {};

    if (year) {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;

      criteria.start_date = {
        [Op.between]: [yearStart, yearEnd],
      };
    }

    if (start_date && end_date) {
      criteria.start_date = {
        [Op.between]: [start_date, end_date],
      };
    }

    const holidays = await this.findAll(criteria);
    let response = {};
    response.rows = holidays;
    response.count = holidays.length;

    return response;
  }
}

module.exports = {
  holidayRepository: new HolidayRepository({
    sequelize: db.sequelize,
  }),
};
