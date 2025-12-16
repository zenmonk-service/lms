
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

    class LeaveRequestManager extends Model {
        static user
        static leave_request

        static associate(models) {
            this.user = LeaveRequestManager.belongsTo(models.user, { foreignKey: 'user_id', as: 'user' })
            this.leave_request = LeaveRequestManager.belongsTo(models.leave_request, { foreignKey: "leave_request_id", as: "leave_request", })
        }

        toJSON() {
            return {
                ...this.get(),
                id: undefined,
                user_id: undefined,
                leave_request_id: undefined,
            };
        }

        setRemark(remarks) {
            this.setDataValue("remarks", remarks);
        }
    }

    LeaveRequestManager.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: "unique_index",
            references: {
                model: 'user',
                key: 'id'
            },
            validate: {
                notEmpty: {
                    msg: "User id is required.",
                },
                notNull: {
                    msg: "User id is required.",
                },
            },
        },
        leave_request_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: "unique_index",
            references: {
                model: 'leave_request',
                key: 'id'
            },
            validate: {
                notEmpty: {
                    msg: "Leave Request id is required.",
                },
                notNull: {
                    msg: "Leave Request id is required.",
                },
            },
        },
        remarks: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        timestamps: false,
        underscored: true,
        tableName: "leave_request_manager",
        indexes: [
            {
                name: "unique_index",
                unique: true,
                fields: ["user_id", "leave_request_id"]
            }
        ],
    });

    return LeaveRequestManager;
};