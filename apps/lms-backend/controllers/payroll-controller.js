const { HTTP_STATUS_CODE } = require("../lib/constants");
const { payrollService } = require("../services");

exports.getFilteredPayrolls = async (req, res, next) => {
  try {
    const response = await payrollService.getFilteredPayrolls(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
  } catch (error) {
    next(error);
  }
};

exports.generatePayroll = async (req, res, next) => {
  try {
    await payrollService.generatePayroll(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json({ message: "Payroll generated successfully." });
  } catch (error) {
    next(error);
  }
};

exports.downloadMonthlyPayroll = async (req, res, next) => {
  try {
    const { filename, buffer } =
      await payrollService.downloadMonthlyPayroll(req);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.send(buffer);
  } catch (err) {
    next(err);
  }
};
