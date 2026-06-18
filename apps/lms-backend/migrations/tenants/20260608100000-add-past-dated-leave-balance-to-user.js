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

    await queryInterface.addColumn(
      {
        tableName: "user",
        schema,
      },
      "emp_code",
      {
        type: DataTypes.STRING,
        allowNull: false,
      },
    );
  },

  down: async (queryInterface, DataTypes, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: "user",
        schema,
      },
      "emp_code",
    );
    await queryInterface.removeColumn(
      {
        tableName: "user",
        schema,
      },
      "past_dated_leave_balance",
    );
  },
};
