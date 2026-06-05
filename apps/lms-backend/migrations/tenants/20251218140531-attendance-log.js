"use strict";

const {
  AttendanceLogType,
} = require("../../models/tenants/attendance/enum/attendance-log-type-enum");

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
        },
        time: {
          type: DataTypes.TIME,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM(AttendanceLogType.getValues()),
          allowNull: false,
          defaultValue: AttendanceLogType.ENUM.CHECK_IN,
        },
        location: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      { schema }
    );
  },

  down: async (queryInterface, Sequelize, schema) => {
    await queryInterface.dropTable("attendance_log", { schema });
  },
};
