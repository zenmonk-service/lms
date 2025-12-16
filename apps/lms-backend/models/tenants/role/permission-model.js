const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");
const PermissionENUM = require("../../common/permission-enum");

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static role_permissions;

    static associate(models) {
      this.role_permissions = Permission.hasMany(models.role_permission, {
        foreignKey: "permission_id",
        as: "role_permissions",
      });
    }
    toJSON() {
      return { ...this.get(), id: undefined };
    }
  }

  Permission.init(
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
        unique: true,
        allowNull: false,
        validate: {
          isValidUUID(value) {
            if (isValidUUID(value) === false)
              throw new Error("Invalid UUID format.");
          },
          notEmpty: {
            msg: "UUID is required",
          },
          notNull: {
            msg: "UUID is required",
          },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Name is required",
          },
          notNull: {
            msg: "Name is required",
          },
        },
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tag: {
        type: DataTypes.ENUM(PermissionENUM.Permission.getValues()),
        allowNull: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "permission",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );
  return Permission;
};
