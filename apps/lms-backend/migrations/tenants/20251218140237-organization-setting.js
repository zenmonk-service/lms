"use strict";

const { AttendanceMethod } = require("../../models/tenants/organization/enum/attendance-method-enum");
const {
  UserIdPattern,
} = require("../../models/tenants/organization/enum/id-pattern-enum");
const {
  WorkDay,
} = require("../../models/tenants/organization/enum/work-day-enum");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "organization_setting",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        attendance_method: {
          type: DataTypes.ENUM(AttendanceMethod.getValues()),
          allowNull: false,
        },
        work_days: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
        start_time: {
          type: DataTypes.TIME,
          allowNull: false,
        },
        end_time: {
          type: DataTypes.TIME,
          allowNull: false,
        },
        employee_id_pattern_type: {
          type: DataTypes.ENUM(UserIdPattern.getValues()),
          allowNull: true,
        },
        employee_id_pattern_value: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        theme: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        deletedAt: {
          type: DataTypes.DATE,
          field: "deleted_at",
        },
      },
      { schema }
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("organization_setting", {
        schema,
        transaction,
      });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_organization_setting_work_days"',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_organization_setting_employee_id_pattern_type"',
        { transaction }
      );
    });
  },
};
