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

    await queryInterface.sequelize.query(
      `ALTER TABLE "${schema}"."leave_balance" DROP CONSTRAINT IF EXISTS "unique_index";`,
    );

    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS "${schema}"."unique_index";`,
    );

    await queryInterface.addConstraint(
      {
        tableName: "leave_balance",
        schema,
      },
      {
        fields: ["user_id", "leave_type_id", "period"],
        type: "unique",
        name: "leave_balance_user_leave_type_period_unique",
      },
    );
  },

  down: async (queryInterface, Sequelize, schema) => {
    await queryInterface.removeConstraint(
      {
        tableName: "leave_balance",
        schema,
      },
      "leave_balance_user_leave_type_period_unique",
    );

    await queryInterface.removeColumn(
      {
        tableName: "leave_balance",
        schema,
      },
      "period",
    );

    await queryInterface.addConstraint(
      {
        tableName: "leave_balance",
        schema,
      },
      {
        fields: ["user_id", "leave_type_id"],
        type: "unique",
        name: "unique_index",
      },
    );
  },
};
