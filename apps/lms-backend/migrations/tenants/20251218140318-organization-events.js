"use strict";

const {
  DayStatus,
} = require("../../models/tenants/organization/enum/day-status-enum");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "organization_event",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        uuid: {
          type: DataTypes.UUID,
          allowNull: false,
          defaultValue: DataTypes.fn("uuid_generate_v4"),
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        start_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        end_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        day_status: {
          type: DataTypes.ENUM(DayStatus.getValues()),
          allowNull: false,
        },
        band_color: {
          type: DataTypes.STRING,
          allowNull: false,
        }
      },
      { schema }
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.dropTable("organization_event", { schema });
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_organization_event_day_status";`
    );
  },
};
