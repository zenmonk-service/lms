const { Op } = require("sequelize");
const { setSchema } = require("../lib/schema");
const { LeaveRequestStatus, Period } = require("@repo/common");
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
