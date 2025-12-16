const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static permission;
    static role;

    static associate(models) {
      this.permission = RolePermission.belongsTo(models.permission, {
        foreignKey: "permission_id",
        as: "permission",
      });

      this.role = RolePermission.belongsTo(models.role, {
        foreignKey: "role_id",
        as: "role",
      });
    }
    toJSON() {
       if (this.permission) {
        return this.permission.dataValues;
       }
      return { ...this.get(), id: undefined, role_id: undefined, permission_id: undefined };
    }
  }

  RolePermission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index",
        references: {
          model: "permission",
          key: "id",
        },
        validate: {
          notNull: {
            msg: "Permission ID is required",
          },
          notEmpty: {
            msg: "Permission ID cannot be empty",
          },
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "unique_index",
        references: {
          model: "role",
          key: "id",
        },
        validate: {
          notNull: {
            msg: "Role ID is required",
          },
          notEmpty: {
            msg: "Role ID cannot be empty",
          },
        },
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      tableName: "role_permission",
      indexes: [
        {
          name: "unique_index",
          unique: true,
          fields: ["permission_id", "role_id"],
        },
      ],
    }
  );
  return RolePermission;
};
