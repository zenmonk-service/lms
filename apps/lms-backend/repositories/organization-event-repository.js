const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Op } = require("sequelize");
const { Paginator } = require("./common/pagination");
const { getSchema } = require("../lib/schema");

class OrganizationEventRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.organization_event.schema(getSchema()),
    });
  }

  async getFilteredOrganizationEvents(
    { date, month, year, start_date, end_date, day_status },
    { page: pageOption, limit: limitOption }
  ) {
    const criteria = {};
    const { offset, limit, page } = new Paginator(pageOption, limitOption);

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      criteria.start_date = {
        [Op.gte]: targetDate,
        [Op.lt]: nextDay,
      };
    } else if (month && year) {
      const startOfMonth = new Date(`${year}-${month}-01T00:00:00`);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      criteria.start_date = {
        [Op.gte]: startOfMonth,
        [Op.lt]: endOfMonth,
      };
    } else if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00`);
      const endOfYear = new Date(`${year}-12-31T23:59:59`);

      criteria.start_date = {
        [Op.gte]: startOfYear,
        [Op.lte]: endOfYear,
      };
    } else if (start_date && end_date) {
      const filterStart = new Date(start_date);
      const filterEnd = new Date(end_date);

      criteria[Op.and] = [
        { end_date: { [Op.gte]: filterStart } },
        { start_date: { [Op.lte]: filterEnd } },
      ];
    }

    if (day_status) {
      criteria.day_status = { [Op.eq]: day_status };
    }

    const response = await this.findAndCountAll(criteria, [], offset, limit);
    response.current_page = page + 1;
    response.per_page = limit;
    response.total = await this.count(criteria);
    return response;
  }

  async createOrganizationEvent(payload) {
    return this.create(payload);
  }

  async updateOrganizationEvent(event_uuid, payload) {
    const criteria = {
      uuid: { [Op.eq]: event_uuid },
    };
    return this.update(criteria, payload);
  }

  async deleteOrganizationEvent(event_uuid) {
    const criteria = {
      uuid: { [Op.eq]: event_uuid },
    };
    return this.destroy(criteria);
  }
}

module.exports = {
  organizationEventRepository: new OrganizationEventRepository({
    sequelize: db.sequelize,
  }),
};
