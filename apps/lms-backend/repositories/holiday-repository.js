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

  async getFilteredHolidays({ name, holiday_uuid, start_date, end_date, year }) {
    const criteria = {};
  
    if (name) criteria.name = { [Op.eq]: name };
    if (holiday_uuid) criteria.uuid = { [Op.eq]: holiday_uuid };
  
    if (year) {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;
    
      criteria.start_date = {
        [Op.between]: [yearStart, yearEnd],
      };
    }
  
    const holidays = await this.findAll(criteria);
    let response = {};
    response.rows = holidays;
    response.count = holidays.length;

    return response;
  }  
  
  async createHoliday(payload) {
    const { name, date_observed, type, description } = payload;
    const holiday = { name, date_observed, type, description };
    return this.create(holiday);
  }

  async getHolidayById(holiday_uuid) {
    let criteria = { uuid: { [Op.eq]: holiday_uuid } };
    return await this.findOne(criteria);
  }

  async updateHolidayById(holiday_uuid, payload) {
    const criteria = { uuid: { [Op.eq]: holiday_uuid } }
    const holiday = {
      name: payload.name,
      date_observed: payload.date_observed,
      holiday_type: payload.holiday_type,
      description: payload.description,
    };
    return this.update(criteria, holiday);
  }

  async createBulkHolidays(payload, transaction) {
    return this.bulkCreate(payload, { transaction })
  }
}

module.exports = {
  holidayRepository: new HolidayRepository({
    sequelize: db.sequelize,
  }),
};
