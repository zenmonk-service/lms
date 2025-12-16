  const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static role_permissions;
    static users;

    static associate(models) {
      this.role_permissions = Role.hasMany(models.role_permission, {
        foreignKey: "role_id",
        as: "role_permissions",
      });
      this.users = Role.hasMany(models.user, {
        foreignKey: "role_id",
        as: "users",
      });
    }

      toJSON() {
        return {
          ...this.get(),
          id: undefined,
          role_level: undefined,
        };
      }
    }

    Role.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        uuid: {
          type: DataTypes.UUID,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
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
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        role_level: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 3,
          set(value) {
            this.setDataValue("role_level", 3);
          },
        }
      },
      {
        sequelize,
        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: "role",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
      }
    );

    return Role;
  };
