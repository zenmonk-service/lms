
const { Model } = require("sequelize");
const { ForbiddenError, ConflictError, BadRequestError } = require("../../../middleware/error");
const { isValidUUID, isValidDate } = require("../../common/validator");
const { LeaveRange } = require("./enum/leave-range-enum");
const { LeaveRequestType } = require("./enum/leave-request-type-enum");
const { LeaveRequestStatus } = require("./enum/leave-request-status-enum");

module.exports = (sequelize, DataTypes) => {

    class LeaveRequest extends Model {
        static user
        static leave_type
        static managers

        static associate(models) {
            this.user = LeaveRequest.belongsTo(models.user, { foreignKey: 'user_id', as: 'user' })
            this.leave_type = LeaveRequest.belongsTo(models.leave_type, { foreignKey: 'leave_type_id', as: 'leave_type' })
            this.managers = LeaveRequest.hasMany(models.leave_request_manager, { foreignKey: 'leave_request_id', as: 'managers' })
        }

        static calculateLeaveDuration(payload) {
            const { start_date, end_date } = payload;
            if (!isValidDate(start_date) || !isValidDate(end_date)) throw new BadRequestError("Invalid date format.", "Invalid date format.");
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays+1;
        }

        isPending() {
            return this.getDataValue("status") === LeaveRequestStatus.ENUM.PENDING;
        }

        isApproved() {
            return this.getDataValue("status") === LeaveRequestStatus.ENUM.APPROVED;
        }

        isRejected() {
            return this.getDataValue("status") === LeaveRequestStatus.ENUM.REJECTED;
        }

        isCancelled() {
            return this.getDataValue("status") === LeaveRequestStatus.ENUM.CANCELLED;
        }

        isRecommended() {
            return this.getDataValue("status") === LeaveRequestStatus.ENUM.RECOMMENDED;
        }

        approve(user) {
            if (this.isCancelled() || this.isRejected()) throw new ForbiddenError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            this.setDataValue("status", LeaveRequestStatus.ENUM.APPROVED)
            this.setDataValue("status_changed_by", [user]);
        }

        recommend(user) {
            if (!this.isPending() && !this.isRecommended()) throw new ForbiddenError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            const changedBy = this.getDataValue("status_changed_by") || [];
            const alreadyRecommended = changedBy.some(u => u.user_id === user.user_id || u.id === user.id);
            if (alreadyRecommended) throw new ForbiddenError({ message: `You have already recommended this leave request.` })
            this.setDataValue("status", LeaveRequestStatus.ENUM.RECOMMENDED);
            this.setDataValue("status_changed_by", [...changedBy, user]);
        }

        reject(user) {
            if (this.isRejected()) throw new ConflictError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            if (this.isCancelled() || this.isApproved()) throw new ForbiddenError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            this.setDataValue("status", LeaveRequestStatus.ENUM.REJECTED);
            this.setDataValue("status_changed_by", [user]);
        }

        cancel(user) {
            if (this.isCancelled()) throw new ConflictError({ message: `Leave Request is already ${this.getDataValue("status")}` })
            if (this.isApproved() || this.isRejected()) throw new ForbiddenError({ message: `Leave Request is ${this.getDataValue("status")}` })
            if (this.user_id !== user.id) throw new ForbiddenError({ message: "You are not authorized to perform this action." })
            this.setDataValue("status", LeaveRequestStatus.ENUM.CANCELLED)
        }
        toJSON() {
            return {
                ...this.get(),
                id: undefined,
                user_id: undefined,
                leave_type_id: undefined,
            };
        }

    }

    LeaveRequest.init({
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
                    if (!isValidUUID(value)) {
                        throw new Error("Invalid UUID.");
                    }
                },
                notEmpty: {
                    msg: "Leave Request UUID is required.",
                },
                notNull: {
                    msg: "Leave Request UUID is required.",
                }
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        leave_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'leave_type',
                key: 'id'
            },
            validate: {
                notEmpty: {
                    msg: "Leave Type id is required.",
                },
                notNull: {
                    msg: "Leave Type id is required.",
                },
            },
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Start Date is required."
                },
                notEmpty: {
                    msg: "Start Date is required."
                },
                isDate: {
                    msg: "Invalid date format."
                },
                isDateBeforeEndDate(value) {
                    if (this.end_date && value > this.end_date) {
                        throw new Error("Start Date should be less than or equal to end_date.");
                    }
                }
            }
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            validate: {
                isDate: {
                    msg: "Invalid date format."
                },
                isDateAfterStartDate(value) {
                    if (value && value < this.start_date) {
                        throw new Error("End Date should be greater than or equal to start_date.");
                    }
                }
            }
        },
        type: {
            type: DataTypes.ENUM(LeaveRequestType.getValues()),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Leave Type is required."
                },
                notEmpty: {
                    msg: "Leave Type is required."
                },
                isIn: {
                    args: [LeaveRequestType.getValues()],
                    msg: `Leave Request Type must be one of: ${LeaveRequestType.getValues().join(", ")}.`
                }
            },
        },
        range: {
            type: DataTypes.ENUM(LeaveRange.getValues()),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Leave Range is required."
                },
                notEmpty: {
                    msg: "Leave Range is required."
                },
                isIn: {
                    args: [LeaveRange.getValues()],
                    msg: `Leave Request Type must be one of: ${LeaveRange.getValues().join(", ")}.`
                },
                isRangeValidForType(value) {
                    const leaveType = this.type;
        
                    if (!leaveType) return;
        
                    const allowedRanges = {
                        [LeaveRequestType.ENUM.FULL_DAY]: [LeaveRange.ENUM.FULL_DAY],
                        [LeaveRequestType.ENUM.HALF_DAY]: [LeaveRange.ENUM.FIRST_HALF, LeaveRange.ENUM.SECOND_HALF],
                        [LeaveRequestType.ENUM.SHORT_LEAVE]: [
                            LeaveRange.ENUM.FIRST_QUARTER,
                            LeaveRange.ENUM.SECOND_QUARTER,
                            LeaveRange.ENUM.THIRD_QUARTER,
                            LeaveRange.ENUM.FOURTH_QUARTER
                        ]
                    };
        
                    if (!allowedRanges[leaveType] || !allowedRanges[leaveType].includes(value)) {
                        const validOptions = allowedRanges[leaveType] ? allowedRanges[leaveType].join(' or ') : 'none';
                        throw new Error(`Invalid Range '${value}' for Leave Type '${leaveType}'. Allowed ranges are: ${validOptions}.`);
                    }
                }
            },
        },         
        leave_duration: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            validate: {
              isValid(value) {
                const type = this.getDataValue("type");
          
                if (type === LeaveRequestType.ENUM.HALF_DAY || type === LeaveRequestType.ENUM.SHORT_LEAVE)
                  return;
          
                if (value == null || value === "")
                  throw new Error("Leave Duration is required.");
          
                if (value < 0)
                  throw new Error("Leave Duration should be positive.");
          
                if (value > 365)
                  throw new Error("Leave Duration should not be greater than 365 days.");
              }
            },
            set(value) {
              const type = this.getDataValue("type");
          
              if (type === LeaveRequestType.ENUM.HALF_DAY)
                value = 0.5;
              else if (type === LeaveRequestType.ENUM.SHORT_LEAVE)
                value = 0.25;
          
              this.setDataValue("leave_duration", value);
            }
          },          
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(LeaveRequestStatus.getValues()),
            allowNull: false,
            defaultValue: LeaveRequestStatus.ENUM.PENDING,
            validate: {
                notNull: {
                    msg: "Status is required."
                },
                notEmpty: {
                    msg: "Status is required."
                },
                isValidStatus(value) {
                    if (!LeaveRequestStatus.isValidValue(value)) {
                        throw new Error("Invalid leave request status.");
                    }
                }
            }
        },
        status_changed_by: {
            type: DataTypes.ARRAY(DataTypes.JSONB),
            allowNull: true
        },
        effective_days: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
    }, {
        sequelize,
        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: "leave_request",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    });

    return LeaveRequest;
};

