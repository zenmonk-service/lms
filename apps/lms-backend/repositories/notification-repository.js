const db = require("../models");
const { Op } = require("sequelize");
const { getSchema } = require("../lib/schema");
const { BaseRepository } = require("./base-repository");

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

  async getNotificationsOfUser(user_uuid, limit = 50) {
    return this.findAll(
      {
        user_id: {
          [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id"),
        },
      },
      [],
      true,
      undefined,
      undefined,
      {
        order: [["created_at", "DESC"]],
        limit,
      },
    );
  }
}

module.exports = {
  notificationRepository: new NotificationRepository({
    sequelize: db.sequelize,
  }),
};
