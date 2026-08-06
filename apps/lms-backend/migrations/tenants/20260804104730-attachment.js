"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable(
      "attachment",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        uuid: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        file_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        meta_data: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        file_url: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        user_document_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "user_document",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        leave_request_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "leave_request",
            key: "id",
          },
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.fn("now"),
          allowNull: false,
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      { schema },
    );
  },

  async down(queryInterface, Sequelize, schema) {
    await queryInterface.dropTable("attachment", { schema });
  },
};
