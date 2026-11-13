const { MessageRecipient } = require("@repo/common");
const { RedisManager } = require("../http/redis/redis-manager");

const getOrganizationUuid = (payload) =>
  payload.headers?.org_uuid || payload.headers?.organization_uuid;

/**
 * Broadcasts an event to everyone with this query's chat open
 * (channel `query:<org_uuid>:<query_uuid>`). Call it after the transaction commits;
 * a publish failure is logged and never fails the request.
 */
exports.publishQueryEvent = async (payload, query, type, data = {}) => {
  try {
    const organizationUuid = getOrganizationUuid(payload);
    const channel = organizationUuid
      ? `query:${organizationUuid}:${query.uuid}`
      : `query:${query.uuid}`;

    await RedisManager.getInstance().publishMessage(channel, {
      send_to: MessageRecipient.ENUM.EVERYONE,
      content: { type, query_uuid: query.uuid, ...data },
    });
  } catch (error) {
    console.error(`Failed to publish ${type} event:`, error);
  }
};

/**
 * Broadcasts a lightweight event on the organization channel so every open query
 * list can update (e.g. status badges). Never carries message content.
 */
exports.publishOrganizationQueryEvent = async (payload, type, data = {}) => {
  try {
    const organizationUuid = getOrganizationUuid(payload);
    if (!organizationUuid) return;

    await RedisManager.getInstance().publishMessage(organizationUuid, {
      send_to: MessageRecipient.ENUM.EVERYONE,
      content: { type, ...data },
    });
  } catch (error) {
    console.error(`Failed to publish organization ${type} event:`, error);
  }
};

