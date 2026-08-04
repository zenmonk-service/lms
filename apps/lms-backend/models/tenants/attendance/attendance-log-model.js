const { Model } = require("sequelize");
const { AttendanceLogType } = require("./enum/attendance-log-type-enum");
const { AttendanceStatus } = require("./enum/attendance-status-enum");

module.exports = (sequelize, DataTypes) => {
  class AttendanceLog extends Model {
    static attendance;
    static performed_by;

    static associate(models) {
      this.attendance = AttendanceLog.belongsTo(models.attendance, {
        foreignKey: "attendance_id",
        as: "attendance",
      });

      this.performed_by = AttendanceLog.belongsTo(models.user, {
        foreignKey: "action_by",
        as: "performed_by",
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
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM(AttendanceLogType.getValues()),
        allowNull: false,
        defaultValue: AttendanceLogType.ENUM.SYSTEM,
        validate: {
          isIn: {
            args: [AttendanceLogType.getValues()],
            msg: "Invalid Document Type.",
          },
        },
      },
      status: {
        type: DataTypes.ENUM(AttendanceStatus.getValues()),
        values: [AttendanceStatus.getValues()],
        allowNull: true,
        validate: {
          isIn: {
            args: [AttendanceStatus.getValues()],
            msg: "Invalid attendance status.",
          },
        },
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
    {
      sequelize,
      timestamps: false,
      underscored: true,
      tableName: "attendance_log",
    },
  );

  return AttendanceLog;
};
