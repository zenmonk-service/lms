"use strict";

module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.addColumn(
      { tableName: "user", schema },
      "designation",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { tableName: "user", schema },
      "employment_type",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { tableName: "user", schema },
      "work_mode",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { tableName: "user", schema },
      "work_branch",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { tableName: "user", schema },
      "official_phone",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { tableName: "user", schema },
      "emergency_contact_name",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { tableName: "user", schema },
      "emergency_contact_relation",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { tableName: "user", schema },
      "emergency_contact_phone",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, DataTypes, schema) {
    await queryInterface.removeColumn({ tableName: "user", schema }, "emergency_contact_phone");
    await queryInterface.removeColumn({ tableName: "user", schema }, "emergency_contact_relation");
    await queryInterface.removeColumn({ tableName: "user", schema }, "emergency_contact_name");
    await queryInterface.removeColumn({ tableName: "user", schema }, "official_phone");
    await queryInterface.removeColumn({ tableName: "user", schema }, "work_branch");
    await queryInterface.removeColumn({ tableName: "user", schema }, "work_mode");
    await queryInterface.removeColumn({ tableName: "user", schema }, "employment_type");
    await queryInterface.removeColumn({ tableName: "user", schema }, "designation");
  },
};
