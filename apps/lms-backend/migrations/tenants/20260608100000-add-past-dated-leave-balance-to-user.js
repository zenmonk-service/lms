"use strict";

module.exports = {
  up: async (queryInterface, DataTypes, schema) => {
    await queryInterface.addColumn(
      {
        tableName: "user",
        schema,
      },
      "past_dated_leave_balance",
      {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    );
  },

  down: async (queryInterface, DataTypes, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: "user",
        schema,
      },
      "past_dated_leave_balance",
    );
  },
};
