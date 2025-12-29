const { Model } = require("sequelize");
const { isValidUUID } = require("../../common/validator");

module.exports = (sequelize, DataTypes) => {

    class Holiday extends Model {
        static organization_holidays

        static associate(models) {
            // this.organization_holidays = Holiday.hasMany(models.organization_holiday, { foreignKey: 'holiday_id', as: 'organization_holidays' })
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
            };
        }
    }

    Holiday.init({
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
            validate: {
                isValidUUID(value) {
                    if (isValidUUID(value) === false)
                        throw new Error("Invalid UUID format.")
                },
                notEmpty: {
                    msg: "Holiday uuid is required.",
                },
                notNull: {
                    msg: "Holiday uuid is required.",
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Holiday name is required.",
                },
                notNull: {
                    msg: "Holiday name is required.",
                },
            },
        },
        date_observed: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Holiday date is required.",
                },
                notNull: {
                    msg: "Holiday date is required.",
                }
            },
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: "holiday",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    })

    return Holiday
};