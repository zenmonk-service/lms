const { Model } = require("sequelize");
const { AttendanceStatus } = require("./enum/attendance-status-enum");
const { isValidUUID } = require("../../common/validator");
const Period = require("../../../lib/period");

module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static user;
    static attendance_log;
    static organization_holiday;

    static associate(models) {
      this.user = Attendance.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
      });
      this.attendance_log = Attendance.hasMany(models.attendance_log, {
        foreignKey: "attendance_id",
        as: "attendance_log",
        onDelete: "CASCADE",
      });
      this.organization_holiday = Attendance.belongsTo(
        models.organization_event,
        {
          foreignKey: "organization_holiday_id",
          as: "organization_holiday",
        },
      );
    }

    isCheckedIn() {
      return this.getDataValue("check_in") && !this.getDataValue("check_out");
    }

    isCheckedOut() {
      return !this.getDataValue("check_out") && this.getDataValue("check_in");
    }

    isOnLeaveOrHoliday() {
      const status = this.getDataValue("status");
      return (
        status === AttendanceStatus.ENUM.ON_LEAVE ||
        status === AttendanceStatus.ENUM.HOLIDAY ||
        status === AttendanceStatus.ENUM.WEEK_OFF
      );
    }

    markCheckOut(status = AttendanceStatus.ENUM.PRESENT) {
      const checkOutTime = Period.getCurrentTime();

      this.setDataValue("check_out", checkOutTime);
      this.setDataValue("status", status);

      let affectedHours = parseFloat(this.getDataValue("affected_hours")) || 0;

      affectedHours += Period.getHoursDifference(
        this.getDataValue("check_in"),
        checkOutTime,
      );

      this.setDataValue("affected_hours", Number(affectedHours.toFixed(2)));
    }

    markCheckIn(status = AttendanceStatus.ENUM.PRESENT) {
      this.setDataValue("check_out", null);
      this.setDataValue("status", status);
      this.setDataValue("check_in", Period.getCurrentTime());
    }

    setStatus(status) {
      this.setDataValue("status", status);
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        user_id: undefined,
      };
    }
  }

  Attendance.init(
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
        validate: {
          isValidUUID(value) {
            if (isValidUUID(value) === false)
              throw new Error("Invalid UUID format.");
          },
          notEmpty: {
            msg: "User ID is required.",
          },
          notNull: {
            msg: "User ID is required.",
          },
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "attendance_user_id_date_unique",
        references: {
          model: "user",
          key: "id",
        },
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: "attendance_user_id_date_unique",
        validate: {
          notEmpty: {
            msg: "Attendance date is required.",
          },
          notNull: {
            msg: "Attendance date is required.",
          },
        },
      },
      check_in: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      check_out: {
        type: DataTypes.TIME,
        allowNull: true,
        validate: {
          validateCheckOut(value) {
            if (
              value &&
              new Date(value).getTime() <
                new Date(this.getDataValue("check_in")).getTime()
            ) {
              throw new Error(
                "Check out time cannot be less than check in time.",
              );
            }
          },
        },
      },
      status: {
        type: DataTypes.ENUM(AttendanceStatus.getValues()),
        values: [AttendanceStatus.getValues()],
        allowNull: false,
        defaultValue: AttendanceStatus.ENUM.ABSENT,
        validate: {
          notEmpty: {
            msg: "Attendance status is required.",
          },
          notNull: {
            msg: "Attendance status is required.",
          },
          isIn: {
            args: [AttendanceStatus.getValues()],
            msg: "Invalid attendance status.",
          },
        },
      },
      affected_hours: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "leave_type",
          key: "id",
        },
      },
      organization_holiday_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "organization_event",
          key: "id",
        },
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      tableName: "attendance",
      indexes: [
        {
          name: "attendance_user_id_date_unique",
          unique: true,
          fields: ["user_id", "date"],
        },
      ],
    },
  );

  return Attendance;
};
