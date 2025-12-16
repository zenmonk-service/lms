"use strict";

const db = require("../../models");
const { createOrganization } = require("../../services/organization-service");
const { createUser } = require("../../services/user-service");

const adminUser = {
  user_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  name: "admin",
  email: "admin@admin.in",
  password: "admin",
  role: "user",
  role_uuid: 'a3b1c6d4-5f27-4e1a-8b3c-9d0f12345678',
  created_at: new Date(),
  updated_at: new Date(),
};

const superAdminUser = {
  user_id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  name: "super-admin",
  email: "superadmin@superadmin.in",
  password: "superadmin",
  role: "superadmin",
  created_at: new Date(),
  updated_at: new Date(),
};

const organization = {
  uuid: "b1eebc91-9c0b-4ef8-bb6d-6bb9bd380a22",
  name: "Test Organization",
  domain: "testorg.com",

};

module.exports = {
  async up(queryInterface, Sequelize, schema) {
    await db.public.user.schema(schema).create(superAdminUser);
    await createOrganization(organization);
await createUser({ body: adminUser, headers: { org_uuid: organization.uuid }, params: {organization_uuid: organization.uuid} });
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.bulkDelete(
      { tableName: "user", schema },
      { user_id: superAdminUser.user_id }
    );
  },
};
