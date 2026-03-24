"use strict";

module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.addColumn(
      { tableName: "user", schema },
      "guardian_contact_name",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { tableName: "user", schema },
      "guardian_contact_relation",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { tableName: "user", schema },
      "guardian_contact_phone",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, DataTypes, schema) {
    await queryInterface.removeColumn(
      { tableName: "user", schema },
      "guardian_contact_phone"
    );
    await queryInterface.removeColumn(
      { tableName: "user", schema },
      "guardian_contact_relation"
    );
    await queryInterface.removeColumn(
      { tableName: "user", schema },
      "guardian_contact_name"
    );
  },
};
