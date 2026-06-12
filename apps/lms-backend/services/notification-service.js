const { RedisManager } = require("../http/redis/redis-manager");
const { Op } = require("sequelize");

const { userRepository } = require("../repositories/user-repository");
const { setSchema } = require("../lib/schema");
const {
  notificationRepository,
} = require("../repositories/notification-repository");

function normalizeSendTo(sendTo) {
  if (sendTo === "everyone") return "everyone";
  if (Array.isArray(sendTo)) return [...new Set(sendTo)];
  if (sendTo) return [sendTo];
  return [];
}

async function getRecipientUsers(sendTo) {
  const normalizedSendTo = normalizeSendTo(sendTo);

  if (normalizedSendTo === "everyone") {
    return userRepository.findAll();
  }

  if (normalizedSendTo.length > 0) {
    return userRepository.findAll({
      user_id: {
        [Op.in]: normalizedSendTo,
      },
    });
  }

  return [];
}

exports.sendNotification = async (channel, message, options = {}) => {
  const normalizedSendTo = normalizeSendTo(message.send_to);

  const recipients = await getRecipientUsers(normalizedSendTo);

  for (const user of recipients) {
    const recipientMessage = {
      send_to: user.user_id,
      content: message.message,
    };

    await notificationRepository.createNotifications(
      [
        {
          user_id: user.id,
          message: recipientMessage,
        },
      ],
      options,
    );

    await RedisManager.getInstance().publishMessage(channel, recipientMessage);
  }

  return recipients;
};

exports.getUserNotifications = async (payload) => {
  const { user_uuid } = payload.params;
  const { page = 1, limit = 10, is_read } = payload.query;
  const notifications = await notificationRepository.getNotificationsOfUser(
    { user_uuid, is_read },
    { page, limit },
  );

  return notifications;
};

exports.getUserUnreadNotificationsCount = async (payload) => {
  const { user_uuid } = payload.params;
  const count = await notificationRepository.getUserUnreadNotificationsCounts({
    user_uuid,
  });
  return { unread_count: count };
};

exports.markNotification = async (
  organization_uuid,
  notification_uuid,
  user_uuid,
) => {
  setSchema(organization_uuid);
  if (user_uuid) {
    console.log("Marking all notifications as read for user:", user_uuid);
    await NotificationRepository.update(
      { is_read: true },
      { where: { user_id: user_uuid } },
    );
  }
  if (notification_uuid) {
    const notification = await notificationRepository.findOne({
      id: notification_uuid,
    });
    notification.markNotification();
    await notification.save();
  }
};
