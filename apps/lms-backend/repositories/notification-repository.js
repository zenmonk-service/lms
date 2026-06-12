const db = require("../models");
const { Op } = require("sequelize");
const { getSchema } = require("../lib/schema");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");

class NotificationRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.notification.schema(getSchema()),
    });
  }

  async createNotifications(payload, options = {}) {
    return this.bulkCreate(payload, options);
  }

  async getNotificationsOfUser(
    { user_uuid, is_read },
    { page: pageOption, limit: limitOption },
  ) {
    let criteria = {};

    const { offset, limit, page } = new Paginator(pageOption, limitOption);

    if (typeof is_read === "boolean") criteria.is_read = { [Op.eq]: is_read };
    if (user_uuid)
      criteria.user_id = {
        [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id"),
      };

    const response = await this.findAndCountAll(criteria, [], offset, limit, [
      ["created_at", "DESC"],
    ]);

    response.page = page + 1;
    response.limit = limit;
    response.total = await this.count(criteria);

    return response;
  }

  async getUserUnreadNotificationsCounts({ user_uuid }) {
    const criteria = {
      user_id: {
        [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id"),
      },
      is_read: {
        [Op.eq]: false,
      },
    };

    return this.count(criteria);
  }
}

module.exports = {
  notificationRepository: new NotificationRepository({
    sequelize: db.sequelize,
  }),
};
