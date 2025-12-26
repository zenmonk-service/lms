const { Op } = require("sequelize");
const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");
class UserRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.user.schema(getSchema()),
    });
  }

  _getAssociation() {
    const include = [
      {
        association: this.model.role,
      },
    ];
    return include;
  }

  async getFilteredUsers(
    { email, is_active, role_uuid },
    { archive, page: pageOption, limit: limitOption, search }
  ) {
    let criteria = {};
    const countAssociation = [];
    let paranoid = true;
    if (is_active) criteria.is_active = { [Op.eq]: is_active };
    if (email) criteria.email = { [Op.like]: `%${email}%` };
    if (search) {
      criteria[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (archive) paranoid = false;
    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    const include = [
      {
        association: this.model.role,
        model: db.tenants.role.schema(getSchema()),
      },
    ];
    const response = await this.model.findAndCountAll({
      where: criteria,
      include,
      offset,
      limit,
      order: [["is_active", "DESC"]],
    });

    response.current_page = page + 1;
    response.per_page = limit;
    response.total = await this.count(
      {},
      { include: countAssociation, paranoid }
    );

    return response;
  }

  async getUserById(userId, withAssociations = true, transaction) {
    let criteria = { user_id: { [Op.eq]: userId } };
    const include = this._getAssociation();
    return this.findOne(
      criteria,
      withAssociations ? include : [],
      undefined,
      undefined,
      transaction
    );
  }
}

module.exports = {
  userRepository: new UserRepository({ sequelize: db.sequelize }),
};
