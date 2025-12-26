const { Model } = require("sequelize");
const { WorkDay } = require("./enum/work-day-enum");
const { UserIdPattern } = require("./enum/id-pattern-enum");
const { AttendanceMethod } = require("./enum/attendance-method-enum");

module.exports = (sequelize, DataTypes) => {
  class OrganizationSetting extends Model {
    static organization;
    static logo;

    static associate(models) {}

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        company_id: undefined,
      };
    }
  }

  OrganizationSetting.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      theme: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      attendance_method: {
        type: DataTypes.ENUM(AttendanceMethod.getValues()),
        allowNull: false,
      },
      work_days: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          validateWorkDays(value) {
            if (!Array.isArray(value)) {
              throw new Error("Work days must be an array.");
            }

            const validDays = WorkDay.getValues();
            for (const day of value) {
              if (!validDays.includes(day)) {
                throw new Error(
                  `Invalid work day "${day}". Must be one of: ${validDays.join(
                    ", "
                  )}`
                );
              }
            }
          },
        },
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Start time is required.",
          },
          notNull: {
            msg: "Start time is required.",
          },
        },
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "End time is required.",
          },
          notNull: {
            msg: "End time is required.",
          },
          validateEndTime(value) {
            if (value <= this.start_time)
              throw new Error("End time must be greater than start time.");
          },
        },
      },
      employee_id_pattern_type: {
        type: DataTypes.ENUM(UserIdPattern.getValues()),
        allowNull: true,
        validate: {
          isIn: {
            args: [UserIdPattern.getValues()],
            msg: `ID pattern type must be one of these values: ${UserIdPattern.getValues().join(
              ", "
            )}`,
          },
        },
      },
      employee_id_pattern_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "organization_setting",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  return OrganizationSetting;
};
