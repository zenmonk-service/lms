'use strict';

module.exports = {
  up: async (queryInterface, DataTypes, schema) => {
    await queryInterface.addColumn(
      {
        tableName: 'leave_request',
        schema,
      },
      'effective_days',
      {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: 'leave_request',
        schema,
      },
      'effective_days'
    );
  },
};
