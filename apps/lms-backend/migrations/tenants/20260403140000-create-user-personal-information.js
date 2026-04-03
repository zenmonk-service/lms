"use strict";

module.exports = {
  async up(queryInterface, DataTypes, schema) {
    // Create user_personal_information table
    await queryInterface.createTable(
      { tableName: "user_personal_information", schema },
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: { tableName: "user", schema },
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        marital_status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        employment_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        work_mode: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        work_branch: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        official_phone: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        emergency_contact_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        emergency_contact_relation: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        emergency_contact_phone: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        guardian_contact_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        guardian_contact_relation: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        guardian_contact_phone: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      }
    );

  },
  

  async down(queryInterface, DataTypes, schema) {
    // Check if user_document table has user_personal_information_id column
  }
};
