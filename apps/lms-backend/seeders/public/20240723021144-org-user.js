"use strict";

const { setSchema } = require("../../lib/schema");
const db = require("../../models");
const { createOrganization } = require("../../services/organization-service");
const { createUser } = require("../../services/user-service");

const empCodes = [
  "1126",
  "1127",
  "1128",
  "1130",
  "1137",
  "1138",
  "1139",
  "1143",
  "1147",
  "1150",
  "1152",
  "1156",
  "1158",
  "1159",
  "1160",
  "1161",
  "1168",
  "1171",
  "1172",
  "1174",
  "1175",
  "1176",
  "1178",
  "1179",
  "1180",
  "1181",
  "1182",
  "1183",
];

const { randomUUID } = require("crypto");

const users = empCodes.map((empCode) => ({
  user_id: randomUUID(),
  name: `user_${empCode}`,
  emp_code: empCode,
  email: `${empCode}@company.in`,
  password: "admin",
  role: "admin",
  role_uuid: "a3b1c6d4-5f27-4e1a-8b3c-9d0f12345678",
  shift_uuid: "e3b1c6d4-5f27-4e1a-8b3c-9d0f12345678",
  created_at: new Date(),
  updated_at: new Date(),
}));

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
  logo_url: "https://github.com/shadcn.png",
};

module.exports = {
  async up(queryInterface, Sequelize, schema) {
    await db.public.user.schema(schema).create(superAdminUser);
    await createOrganization(organization);
    for (const user of users) {
      try {
        console.log("Creating", user.emp_code);
        setSchema(organization.uuid);
        await createUser({
          body: user,
          headers: {
            org_uuid: organization.uuid,
          },
          params: {
            organization_uuid: organization.uuid,
          },
        });

        console.log("Created", user.emp_code);
      } catch (error) {
        console.error(`Failed for ${user.emp_code}`);
        console.error(error);
        console.error(error.stack);

        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.bulkDelete(
      { tableName: "user", schema },
      { user_id: superAdminUser.user_id },
    );
  },
};
