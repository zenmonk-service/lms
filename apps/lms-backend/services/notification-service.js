const { RedisManager } = require("../http/redis/redis-manager");
const { Op } = require("sequelize");
const {
  notificationRepository,
} = require("../repositories/notification-repository");
const { userRepository } = require("../repositories/user-repository");

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
      message: message.message,
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

    console.log('recipientMessage: ', recipientMessage);
    await RedisManager.getInstance().publishMessage(channel, recipientMessage);
  }

  return recipients;
};

exports.getUserNotifications = async (user_uuid, limit = 50) => {
  const notifications = await notificationRepository.getNotificationsOfUser(
    user_uuid,
    Math.min(limit, 50),
  );

  return {
    rows: notifications,
    count: notifications.length,
  };
};
