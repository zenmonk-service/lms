"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "payroll",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "user",
            key: "id",
          },
        },
        leave_balance_deficit: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        attendance_penalty: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        period: {
          type: DataTypes.STRING(7),
          allowNull: false,
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
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        schema,
        uniqueKeys: {
          unique_index: {
            fields: ["user_id", "period"],
          },
        },
      },
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.dropTable("payroll", { schema });
  },
};
