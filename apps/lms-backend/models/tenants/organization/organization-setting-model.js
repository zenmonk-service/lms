const { Model } = require("sequelize");
const { WorkDay } = require("./enum/work-day-enum");
const { EmployeeIdMode } = require("./enum/employee-id-mode-enum");
const { AttendanceMethod } = require("./enum/attendance-method-enum");
const { TimePeriod } = require("../../common/time-period-enum");

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
                    ", ",
                  )}`,
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
      employee_id_pattern: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          type: EmployeeIdMode.ENUM.MANUAL,
        },
      },
      past_dated_leave: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
          validatePDL(value) {
            if (!value) return;

            if (typeof value !== "object" || Array.isArray(value)) {
              throw new Error("Invalid format: Must be a JSON object");
            }

            const { tenure, balance } = value;

            if (!TimePeriod.getValues().includes(tenure)) {
              throw new Error("Invalid tenure.");
            }
            if (typeof balance !== "number" || balance < 0) {
              throw new Error("Invalid balance: Must be a non-negative number");
            }
          },
        },
      },
      sandwich_leave_exception: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
          validateSandwichException(value) {
            if (!value) return;

            if (typeof value !== "object" || Array.isArray(value)) {
              throw new Error("Invalid format: Must be a JSON object.");
            }

            const { tenure, roles, users } = value;

            if (!TimePeriod.getValues().includes(tenure)) {
              throw new Error("Invalid accrual period.");
            }

            if (!Array.isArray(roles)) {
              throw new Error("roles must be an array.");
            }

            if (!Array.isArray(users)) {
              throw new Error("users must be an array.");
            }
          },
        },
      },

      clubbing_leave_exception: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
          validateClubbingException(value) {
            if (!value) return;

            if (typeof value !== "object" || Array.isArray(value)) {
              throw new Error("Invalid format: Must be a JSON object.");
            }

            const { tenure, roles, users } = value;

            if (!TimePeriod.getValues().includes(tenure)) {
              throw new Error("Invalid accrual period.");
            }

            if (!Array.isArray(roles)) {
              throw new Error("roles must be an array.");
            }

            if (!Array.isArray(users)) {
              throw new Error("users must be an array.");
            }
          },
        },
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
    },
  );

  return OrganizationSetting;
};
