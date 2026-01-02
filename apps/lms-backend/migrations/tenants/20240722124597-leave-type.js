"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "leave_type",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        uuid: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.fn("uuid_generate_v4"),
          allowNull: false,
          unique: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        code: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: "unique_index",
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        applicable_for: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        max_consecutive_days: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        allow_negative_leaves: {
          type: DataTypes.BOOLEAN,
          default: true,
          allowNull: false,
        },
        min_consecutive_days: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        allow_negative_leaves: {
          type: DataTypes.BOOLEAN,
          default: true,
          allowNull: false,
        },
        min_waiting_period: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        is_attachment_required: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_sandwich_enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_clubbing_enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        carry_forward: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        accrual: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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
    await queryInterface.dropTable("leave_type", schema);
  },
};
