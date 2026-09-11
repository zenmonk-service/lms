"use strict";

const {
  LeaveBalanceLogSource,
} = require("../../models/tenants/leave/enum/leave-balance-log-source-enum");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "leave_balance_log",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        uuid: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          unique: true,
        },
        leave_request_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "leave_request",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        leave_balance_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "leave_balance",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        leave_balance_deducted: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        source: {
          type: DataTypes.ENUM(LeaveBalanceLogSource.getValues()),
          allowNull: false,
        },
        settled_against_leave_balance_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "leave_balance",
            key: "id",
          },
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
      },
      { schema },
    );

    await queryInterface.addIndex(
      { tableName: "leave_balance_log", schema },
      ["leave_request_id"],
      { name: "leave_balance_log_leave_request_id" },
    );

    await queryInterface.addIndex(
      { tableName: "leave_balance_log", schema },
      ["leave_balance_id"],
      { name: "leave_balance_log_leave_balance_id" },
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.dropTable("leave_balance_log", { schema });
  },
};
