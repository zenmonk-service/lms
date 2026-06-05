const { Model } = require("sequelize");

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
      guardian_contact_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      guardian_contact_relation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      guardian_contact_phone: {
        type: DataTypes.STRING,
        allowNull: true,
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
    }
  );

  return UserPersonalInformation;
};
