const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");
const { ConflictError } = require("../../../middleware/error");

module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    static users;

    static associate(models) {
      this.users = Organization.belongsToMany(models.user, {
        through: "organization_user",
      });
    }

    getOrganizationSchemaName() {
      return `org_${this.uuid}`;
    }

    isActive() {
      return this.getDataValue("is_active");
    }

    activate() {
      if (this.isActive())
        throw new ConflictError("Organization is already activated.");
      this.setDataValue("is_active", true);
    }

    deactivate() {
      if (!this.isActive())
        throw new ConflictError("Organization is already deactivated.");
      this.setDataValue("is_active", false);
    }
  }

  Organization.init(
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
        validate: {
          isValidUUID(value) {
            if (isValidUUID(value) === false)
              throw new Error("Invalid UUID format.");
          },
          notEmpty: {
            msg: "Organization uuid is required.",
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
      domain: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Domain is required.",
          },
          notNull: {
            msg: "Domain is required.",
          },
          isUrl: {
            msg: "Invalid domain URL format.",
          },
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "organization",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  return Organization;
};
