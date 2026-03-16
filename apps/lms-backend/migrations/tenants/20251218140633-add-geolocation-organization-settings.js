'use strict';

module.exports = {
  up: async (queryInterface, DataTypes, schema) => {
    await queryInterface.addColumn(
      {
        tableName: 'organization_setting',
        schema,
      },
      'geolocation',
      {
        type: DataTypes.JSONB,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: 'organization_setting',
        schema,
      },
      'geolocation'
    );
  },
};
