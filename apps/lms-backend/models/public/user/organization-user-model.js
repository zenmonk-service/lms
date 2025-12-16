"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrganizationUser extends Model {

    static associate(models) {
      this.belongsTo(models.organization, {
        foreignKey: "organization_id",
        as: "organization",
        onDelete: "CASCADE",
      });

      this.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
      });
    }

    activate() {
      this.setDataValue("is_active", true);
    }

    deactivate() {
      this.setDataValue("is_active", false);
    }
  }

  OrganizationUser.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "organization",
          key: "id",
        },
        validate: {
          notNull: { msg: "organization_id is required" },
        },
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        validate: {
          notNull: { msg: "user_id is required" },
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
      modelName: "organization_user",
      tableName: "organization_user",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return OrganizationUser;
};
