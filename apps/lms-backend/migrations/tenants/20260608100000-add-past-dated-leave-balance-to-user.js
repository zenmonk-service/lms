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
      "sandwich_leave_exception",
      {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    );
    await queryInterface.addColumn(
      {
        tableName: "user",
        schema,
      },
      "clubbing_leave_exception",
      {
        type: DataTypes.BOOLEAN,
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
        unique: true,
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
      "clubbing_leave_exception",
    );
    await queryInterface.removeColumn(
      {
        tableName: "user",
        schema,
      },
      "sandwich_leave_exception",
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
