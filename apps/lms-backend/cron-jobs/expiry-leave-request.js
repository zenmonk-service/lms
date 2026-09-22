const { Op } = require("sequelize");
const { setSchema } = require("../lib/schema");
const {
  LeaveRequestStatus,
} = require("@repo/common");
const Period = require("../lib/period");
const {
  leaveRequestRepository,
} = require("../repositories/leave-request-repository");

exports.expiryLeaveRequests = async (organization_uuid) => {
  setSchema(organization_uuid);

  await leaveRequestRepository.update(
    {
      status: LeaveRequestStatus.ENUM.EXPIRED,
    },
    {
      status: LeaveRequestStatus.ENUM.PENDING,
      start_date: {
        [Op.lt]: Period.getCurrentDate(),
      },
    },
  );
};
