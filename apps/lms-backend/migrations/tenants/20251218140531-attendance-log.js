"use strict";

const { AttendanceLogType, AttendanceStatus } = require("@repo/common");

module.exports = {
  up: async (queryInterface, DataTypes, schema) => {
    await queryInterface.createTable(
      "attendance_log",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        attendance_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "attendance",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        time: {
          type: DataTypes.TIME,
          allowNull: true,
        },
        type: {
          type: DataTypes.ENUM(AttendanceLogType.getValues()),
          allowNull: false,
          defaultValue: AttendanceLogType.ENUM.SYSTEM,
        },
        status: {
          type: DataTypes.ENUM(AttendanceStatus.getValues()),
          allowNull: true,
        },
        location: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        remarks: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        action_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "user",
            key: "id",
          },
        },
      },
      { schema },
    );
  },

  down: async (queryInterface, Sequelize, schema) => {
    await queryInterface.dropTable("attendance_log", { schema });
  },
};
