"use strict";

module.exports = {
  up: async (queryInterface, DataTypes, schema) => {
    await queryInterface.addColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "sandwich_leave_exception",
      {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "clubbing_leave_exception",
      {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "past_dated_leave",
      {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "flexible_time",
      {
        type: DataTypes.TIME,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "late_exception",
      {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    );
  },

  down: async (queryInterface, DataTypes, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "past_dated_leave",
    );
    await queryInterface.removeColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "flexible_time",
    );
    await queryInterface.removeColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "late_exception",
    );
    await queryInterface.removeColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "clubbing_leave_exception",
    );
    await queryInterface.removeColumn(
      {
        tableName: "organization_setting",
        schema,
      },
      "sandwich_leave_exception",
    );
  },
};
