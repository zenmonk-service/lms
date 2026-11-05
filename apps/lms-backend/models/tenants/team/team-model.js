const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static lead;
    static members;
    static memberships;

    static associate(models) {
      this.lead = Team.belongsTo(models.user, {
        foreignKey: "lead_id",
        as: "lead",
      });
      // Membership rows are the user_team rows without a manager.
      this.members = Team.belongsToMany(models.user, {
        through: { model: models.user_team, scope: { manager_id: null }, unique: false },
        foreignKey: "team_id",
        otherKey: "user_id",
        as: "members",
      });
      this.memberships = Team.hasMany(models.user_team, {
        foreignKey: "team_id",
        scope: { manager_id: null },
        as: "memberships",
      });
    }
  }

  Team.init(
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
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue("name", typeof value === "string" ? value.trim() : value);
        },
        validate: {
          notEmpty: { msg: "Team name is required." },
          notNull: { msg: "Team name is required." },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lead_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "user",
          key: "id",
        },
      },
    },
    {
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "team",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  return Team;
};
