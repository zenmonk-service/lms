const db = require("../../models");

/** Public user fields exposed on queries, members and messages. */
const USER_SUMMARY_ATTRIBUTES = ["id", "user_id", "name", "email", "image"];

const ATTACHMENT_ATTRIBUTES = [
  "id",
  "uuid",
  "file_name",
  "file_url",
  "meta_data",
  "created_at",
];

/**
 * Include builders. They take the repository's `tenant` function so every
 * association is resolved against the current tenant schema.
 */
const userInclude = (tenant, as) => ({
  model: tenant(db.tenants.user),
  as,
  attributes: USER_SUMMARY_ATTRIBUTES,
});

/** A member's user and the user who assigned them. */
const memberUserIncludes = (tenant) => [
  userInclude(tenant, "user"),
  userInclude(tenant, "assigner"),
];

/** A message's sender and its attachment. */
const messageIncludes = (tenant) => [
  userInclude(tenant, "sender"),
  {
    model: tenant(db.tenants.attachment),
    as: "attachment",
    attributes: ATTACHMENT_ATTRIBUTES,
  },
];

module.exports = {
  USER_SUMMARY_ATTRIBUTES,
  userInclude,
  memberUserIncludes,
  messageIncludes,
};
