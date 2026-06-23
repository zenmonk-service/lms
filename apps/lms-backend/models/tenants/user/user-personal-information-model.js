const { Model } = require("sequelize");
const { isValidPhoneNumber } = require("../../common/validator");
const { MaritalStatus } = require("./enum/marital-status-enum");
const { Gender } = require("./enum/gender-enum");
const { WorkMode } = require("./enum/work-mode-enum");

module.exports = (sequelize, DataTypes) => {
  class UserPersonalInformation extends Model {
    static user;
    static documents;

    static associate(models) {
      this.user = UserPersonalInformation.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  UserPersonalInformation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      marital_status: {
        type: DataTypes.ENUM(MaritalStatus.getValues()),
        allowNull: true,
        validate: {
          isIn: {
            args: [MaritalStatus.getValues()],
            msg: "Invalid marital status.",
          },
        },
      },
      dob: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: {
            msg: "Invalid date format.",
          },
        },
      },
      gender: {
        type: DataTypes.ENUM(Gender.getValues()),
        allowNull: true,
        validate: {
          isIn: {
            args: [Gender.getValues()],
            msg: "Invalid Gender.",
          },
        },
      },
      work_mode: {
        type: DataTypes.ENUM(WorkMode.getValues()),
        allowNull: true,
        validate: {
          isIn: {
            args: [WorkMode.getValues()],
            msg: "Invalid Work Mode.",
          },
        },
      },
      work_branch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isValidPhoneNumber(value) {
            if (value && isValidPhoneNumber(value) === false)
              throw new Error("Invalid phone number.");
          },
        },
      },
      parent_information: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
          validateInformation(value) {
            if (value && typeof value !== "object") {
              throw new Error("Invalid parent information format.");
            }
            if (
              value &&
              value.father_name &&
              typeof value.father_name !== "string"
            ) {
              throw new Error("Father name must be a string.");
            }
            if (
              value &&
              value.mother_name &&
              typeof value.mother_name !== "string"
            ) {
              throw new Error("Mother name must be a string.");
            }
            if (
              value &&
              value.father_phone &&
              !isValidPhoneNumber(value.father_phone)
            ) {
              throw new Error("Invalid father phone number.");
            }
            if (
              value &&
              value.mother_phone &&
              !isValidPhoneNumber(value.mother_phone)
            ) {
              throw new Error("Invalid mother phone number.");
            }
          },
        },
      },
      guardian_information: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
          validateInformation(value) {
            if (value && typeof value !== "object") {
              throw new Error("Invalid guardian information format.");
            }
            if (
              value &&
              value.guardian_phone &&
              !isValidPhoneNumber(value.guardian_phone)
            ) {
              throw new Error("Invalid Guardian phone number.");
            }
            if (
              value &&
              value.relation &&
              !GuardianRelation.getValues().includes(value.relation)
            ) {
              throw new Error(
                `Invalid guardian relation. Allowed values: ${GuardianRelation.getValues().join(", ")}`,
              );
            }
          },
        },
      },
      current_address: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: "Current address cannot exceed 255 characters.",
          },
        },
      },
      permanent_address: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: "Permanent address cannot exceed 255 characters.",
          },
        },
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "user_personal_information",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  return UserPersonalInformation;
};
