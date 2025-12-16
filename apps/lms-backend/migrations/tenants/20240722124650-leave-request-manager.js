"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes, schema) {
    await queryInterface.createTable("leave_request_manager", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index",
        references: {
          model: "user",
          key: "id",
        },
      },
      leave_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index",
        references: {
          model: "leave_request",
          key: "id",
        },
      },
      remarks: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    }, {
      schema,
      uniqueKeys: {
        unique_index: {
          fields: ["user_id", "leave_request_id"]
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("leave_request_manager");
    });
  },
};
