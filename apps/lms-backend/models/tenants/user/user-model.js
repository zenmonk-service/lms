const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");
const { ConflictError } = require("../../../middleware/error");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static role;
    static organization_shift;
    static documents;
    static associate(models) {
      this.role = User.belongsTo(models.role, {
        foreignKey: "role_id",
        as: "role",
      });
      this.organization_shift = User.belongsTo(models.organization_shift, {
        foreignKey: "shift_id",
        as: "organization_shift",
      });
      this.documents = User.hasMany(models.user_document, {
        foreignKey: "user_id",
        as: "documents",
      });
    }

    isActive() {
      return this.getDataValue("is_active");
    }

    activate() {
      if (this.isActive())
        throw new ConflictError("User is already activated.");
      this.setDataValue("is_active", true);
    }

    deactivate() {
      if (!this.isActive())
        throw new ConflictError("User is already deactivated.");
      this.setDataValue("is_active", false);
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name is required.",
          },
          notNull: {
            msg: "Name is required.",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Email already exists.",
        },
        validate: {
          isEmail: {
            msg: "Invalid email format.",
          },
          notEmpty: {
            msg: "Email is required.",
          },
          notNull: {
            msg: "Email is required.",
          },
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "role",
          key: "id",
        },
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "user",
          key: "id",
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shift_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "organization_shift",
          key: "id",
        },
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      employment_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      work_mode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      work_branch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      official_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emergency_contact_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emergency_contact_relation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emergency_contact_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "user",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  return User;
};
