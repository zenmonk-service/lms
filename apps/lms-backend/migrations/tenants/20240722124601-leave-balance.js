"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "leave_balance",
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
          unique: "unique_index",
          references: {
            model: "user",
            key: "id",
          },
        },
        leave_type_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: "unique_index",
          references: {
            model: "leave_type",
            key: "id",
          },
        },
        leaves_allocated: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        balance: {
          type: DataTypes.DECIMAL(10, 2),
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
    await queryInterface.dropTable("leave_balance", schema);
  },
};
