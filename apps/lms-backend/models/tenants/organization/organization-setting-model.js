const { Model } = require("sequelize");
const { WorkDay } = require("./enum/work-day-enum");
const { EmployeeIdMode } = require("./enum/employee-id-mode-enum");
const { AttendanceMethod } = require("./enum/attendance-method-enum");
const { TimePeriod } = require("../../common/time-period-enum");
const {
  CutoffAllocationType,
} = require("../../common/cutoff-allocaion-type-enum");

module.exports = (sequelize, DataTypes) => {
  class OrganizationSetting extends Model {
    static role;

    static associate(models) {
      this.role = OrganizationSetting.belongsTo(models.role, {
        foreignKey: "role_id",
        as: "role",
      });
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
        allowNull: true,
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

            const { tenure, roles, users, balance } = value;

            if (!TimePeriod.getValues().includes(tenure)) {
              throw new Error("Invalid accrual period.");
            }

            if (!Array.isArray(roles)) {
              throw new Error("roles must be an array.");
            }

            if (typeof balance !== "number" || balance < 0) {
              throw new Error("Invalid balance: Must be a non-negative number");
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

            const { tenure, roles, users, balance } = value;

            if (!TimePeriod.getValues().includes(tenure)) {
              throw new Error("Invalid accrual period.");
            }

            if (!Array.isArray(roles)) {
              throw new Error("roles must be an array.");
            }

            if (typeof balance !== "number" || balance < 0) {
              throw new Error("Invalid balance: Must be a non-negative number");
            }

            if (!Array.isArray(users)) {
              throw new Error("users must be an array.");
            }
          },
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "role",
          key: "id",
        },
      },

      leave_allocation_cutoff: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
          validateLeaveAllocationCutoff(value) {
            if (!value) return;

            if (typeof value !== "object" || Array.isArray(value)) {
              throw new Error("Invalid format: Must be a JSON object.");
            }

            const { cut_off, allocation_type, is_applicable } = value;

            if (cut_off !== undefined && (typeof cut_off !== "number" || cut_off < 1 || cut_off > 31)) {
              throw new Error("Invalid cutoff: Must be a number between 1 and 31.");
            }

            if (allocation_type !== undefined && !Object.values(CutoffAllocationType).includes(allocation_type)) {
              throw new Error("Invalid allocation type.");
            }

            if (typeof is_applicable !== "boolean") {
              throw new Error("isApplicable must be a boolean.");
            }
          },
        },
      },
      flexible_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },

      late_exception: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
          validateLateException(value) {
            if (!value) return;

            if (typeof value !== "object" || Array.isArray(value)) {
              throw new Error("Invalid format: Must be a JSON object.");
            }

            const { isApplicable, tenure, count, time } = value;

            if (typeof isApplicable !== "boolean") {
              throw new Error("isApplicable must be a boolean.");
            }

            if (
              tenure !== undefined &&
              !TimePeriod.getValues().includes(tenure)
            ) {
              throw new Error("Invalid accrual period.");
            }

            if (
              count !== undefined &&
              (typeof count !== "number" || count < 0)
            ) {
              throw new Error("Invalid count: Must be a non-negative number.");
            }

            if (time !== undefined && typeof time !== "string") {
              throw new Error(
                "Invalid time: Must be a string in HH:mm:ss format.",
              );
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
