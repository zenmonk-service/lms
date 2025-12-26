const { Model } = require("sequelize");
const { AttendanceLogType } = require("./enum/attendance-log-type-enum");

module.exports = (sequelize, DataTypes) => {
  class AttendanceLog extends Model {
    static attendance;
    static associate(models) {
      this.attendance = AttendanceLog.belongsTo(models.attendance, {
        foreignKey: "attendance_id",
        as: "attendance",
      });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        attendance_id: undefined,
      };
    }
  }

  AttendanceLog.init(
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
        validate: {
          notEmpty: {
            msg: "time is required.",
          },
          notNull: {
            msg: "time is required.",
          },
        },
      },
      type: {
        type: DataTypes.ENUM(AttendanceLogType.getValues()),
        values: [AttendanceLogType.getValues()],
        allowNull: false,
        defaultValue: AttendanceLogType.ENUM.CHECK_IN,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isIP: {
            msg: "Must be a valid IP",
          },
        },
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      tableName: "attendance_log",
    }
  );

  return AttendanceLog;
};
