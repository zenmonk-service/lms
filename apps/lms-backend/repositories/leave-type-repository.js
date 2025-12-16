const { Op } = require("sequelize");
const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");
class LeaveTypeRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.leave_type.schema(getSchema()),
    });
  }

  async updateLeaveTypeById(leave_type_uuid, leaveType) {
    return this.model.update(leaveType, {
      where: { uuid: leave_type_uuid },
      returning: true,
    });
  }

  async getFilteredLeaveTypes(
    { search },
    { order_type, order_column, page: pageOption, limit: limitOption }
  ) {
    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    let criteria = {};
    if (search) {
      criteria[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const order = [[order_column, order_type]];

    const response = await this.findAndCountAll(
      criteria,
      [],
      offset,
      limit,
      order
    );
    response.current_page = page + 1;
    response.per_page = limit;
    response.total = await this.count();
    return response;
  }
}

module.exports = {
  leaveTypeRepository: new LeaveTypeRepository({ sequelize: db.sequelize }),
};
