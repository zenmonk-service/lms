const { Op } = require("sequelize");
const { sequelize } = require("../config/db-connection");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class PayrollRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.payroll,
    });
  }

  async getFilteredPayrolls(month, year, offset, page, limit, search) {
    const include = [];
    const criteria = {};

    include.push({
      association: this.model.user,
      model: this.tenant(db.tenants.user),
      attributes: ["user_id", "name", "emp_code", "email", "employment_type"],
      include: [
        {
          association: this.model.role,
          as: "role",
          model: this.tenant(db.tenants.role),
          attributes: ["uuid", "name", "code"],
        },
      ],
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    criteria.updated_at = {
      [Op.gte]: startDate,
      [Op.lt]: endDate,
    };

    if (search) {
      criteria[Op.or] = [
        { "$user.name$": { [Op.iLike]: `%${search}%` }},
      ];
    }

    const { rows, count } = await this.findAndCountAll(
      criteria,
      include,
      offset,
      limit,
      [["created_at", "ASC"]],
      true,
      { exclude: ["user_id"] },
    );

    return {
      rows,
      count,
      current_page: page + 1,
      per_page: limit,
      total: await this.count(),
    };
  }
}

module.exports = {
  payrollRepository: new PayrollRepository({
    sequelize: db.sequelize,
  }),
};
