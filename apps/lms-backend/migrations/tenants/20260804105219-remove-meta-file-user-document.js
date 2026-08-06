"use strict";

module.exports = {
  up: async (queryInterface, DataTypes, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: "user_document",
        schema,
      },
      "metadata",
    );
    await queryInterface.removeColumn(
      {
        tableName: "user_document",
        schema,
      },
      "file_urls",
    );
  },

  down: async (queryInterface, DataTypes, schema) => {
    await queryInterface.removeColumn(
      {
        tableName: "user_document",
        schema,
      },
      "metadata",
      {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    );
    await queryInterface.addColumn(
      {
        tableName: "user_document",
        schema,
      },
      "file_urls",
      {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    );
  },
};

