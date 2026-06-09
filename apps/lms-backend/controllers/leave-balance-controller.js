const { HTTP_STATUS_CODE } = require("../lib/constants");
const { leaveBalanceService } = require("../services");


exports.addSlaToLeaveBalance = async (req,res, next) => {
     try {
        await leaveBalanceService.addSlaToLeaveBalance(req);
        res.status(HTTP_STATUS_CODE.ENUM.CREATED).json({ message: "Leave Balance updated successfully." });
    } catch (err) {
        console.log('err: ', err);
        next(err);
    }
}