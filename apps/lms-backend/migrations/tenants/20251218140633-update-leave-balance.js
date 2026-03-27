"use strict";

module.exports = {
  up: async (queryInterface, DataTypes, schema) => {
    await queryInterface.addColumn(
      {
        tableName: "leave_balance",
        schema,
      },
      "period",
      {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
    );
  },

  down: async (queryInterface, Sequelize, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: "leave_balance",
        schema,
      },
      "period",
    );
  },
};
