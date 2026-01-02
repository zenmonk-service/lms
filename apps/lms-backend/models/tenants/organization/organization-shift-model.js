const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");

module.exports = (sequelize, DataTypes) => {
  class OrganizationShift extends Model {
        static users; 
        static associate(models) {
            this.users = OrganizationShift.hasMany(models.user, {foreignKey:'user_id', as: 'users'})
        }


    toJSON() {
      return {
        ...this.get(),
        id: undefined,
      
      };
    }
  }

  OrganizationShift.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name :{
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Shift name is required.",
          },
          notNull: {
            msg: "Shift name is required.",
          },
        },
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
            msg: "Organization Event uuid is required.",
          },
        },
      },
      start_time:{
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Event start time is required.",
          },
          notNull: {
            msg: "Event start time is required.",
          },
        },
      },
      end_time:{
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Event end time is required.",
          },
          notNull: {
            msg: "Event end time is required.",
          },
        },
      },
      flexible_time :{
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '00:00:00',
        validate: {
          notEmpty: {
            msg: "Flexible time is required.",
          },
          notNull: {
            msg: "Flexible time is required.",
          },
        },
      },
      effective_hours:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Effective hours is required.",
          },
          notNull: {
            msg: "Effective hours is required.",
          },
        underscored: true,
        }}
    },{
         
      sequelize,
      paranoid: true,
      timestamps: true,
      underscored: true,
      tableName: "organization_shift",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    
    }
  );

  return OrganizationShift;
};
