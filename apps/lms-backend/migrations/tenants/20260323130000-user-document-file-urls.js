"use strict";

module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.addColumn(
      { tableName: "user_document", schema },
      "file_urls",
      {
        type: DataTypes.JSONB,
        allowNull: true,
      }
    );

    await queryInterface.sequelize.query(
      `UPDATE "${schema}"."user_document"
       SET "file_urls" = jsonb_build_array("file_url")
       WHERE "file_url" IS NOT NULL AND "file_url" <> ''`
    );
  },

  async down(queryInterface, DataTypes, schema) {
    await queryInterface.removeColumn(
      { tableName: "user_document", schema },
      "file_urls"
    );
  },
};
