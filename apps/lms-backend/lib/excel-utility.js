const XLSX = require("xlsx");
const XLSXChart = require("xlsx-chart");
const { DownloadExcel } = require("../services/enum/download-excel.enum");

class ExcelUtility {
  static readFile(buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });
  }

  static async writeFile(type, data, options = {}) {
    const workbook = XLSX.utils.book_new();

    let worksheet;

    switch (type) {
      case DownloadExcel.ENUM.DAILY_ATTENDANCE:
        worksheet = this.generateDailyAttendanceSheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        break;
      case DownloadExcel.ENUM.MONTHLY_ATTENDANCE:
        worksheet = this.generateMonthlyAttendanceSheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        break;
      case DownloadExcel.ENUM.DAILY_ATTENDANCE_CHART:
        return this.generateChartBuffer(
          this.generateDailyAttendancePieChartOpts(data)
        );
      case DownloadExcel.ENUM.MONTHLY_ATTENDANCE_CHART:
        return this.generateChartBuffer(
          this.generateMonthlyAttendanceBarChartOpts(data)
        );
      default:
        throw new Error(`Unsupported excel export type: ${type}`);
    }

    return XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });
  }

  static generateChartBuffer(opts) {
    return new Promise((resolve, reject) => {
      const xlsxChart = new XLSXChart();

      xlsxChart.generate(opts, (err, result) =>
        err ? reject(err) : resolve(Buffer.from(result, "base64"))
      );
    });
  }

  static generateDailyAttendanceSheet(usersData) {
    const attendanceDate =
      usersData.find((user) => user.attendances?.length)?.attendances[0]
        ?.date || "";

    const rows = [
      [`Attendance Report - ${attendanceDate}`],
      [],
      ["Employee", "Check In", "Check Out", "Status", "Employee Code"],
    ];

    usersData.forEach((user) => {
      const attendance = user.attendances?.[0];

      rows.push([
        user.name,
        attendance?.check_in || "-",
        attendance?.check_out || "-",
        attendance?.status || "Absent",
        user.emp_code || user.user_id,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: 4 },
      },
    ];

    ws["!cols"] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
    ];

    return ws;
  }

  static generateMonthlyAttendanceSheet(usersData) {
    const users = {};
    const dates = new Set();

    usersData.forEach((user) => {
      const id = user.user_id;

      users[id] = {
        name: user.name,
        employeeCode: user.emp_code || user.user_id,
        attendance: {},
      };

      (user.attendances || []).forEach((attendance) => {
        users[id].attendance[attendance.date] = attendance;
        dates.add(attendance.date);
      });
    });

    const sortedDates = [...dates].sort();

    const rows = [];
    const merges = [];

    rows.push(["Employee (Emp Code)", "Field", ...sortedDates]);

    let currentRow = 1;

    Object.values(users).forEach((user) => {
      const fields = ["Check In", "Check Out", "Status", "Affected Hours"];

      fields.forEach((field, index) => {
        const row = [];

        row.push(index === 0 ? `${user.name} (${user.employeeCode})` : "");
        row.push(field);

        sortedDates.forEach((date) => {
          const attendance = user.attendance[date];

          switch (field) {
            case "Check In":
              row.push(attendance?.check_in || "-");
              break;

            case "Check Out":
              row.push(attendance?.check_out || "-");
              break;

            case "Status":
              row.push(attendance?.status || "-");
              break;

            case "Affected Hours":
              row.push(attendance?.affected_hours || "-");
              break;
          }
        });

        rows.push(row);
      });

      merges.push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow + fields.length - 1, c: 0 },
      });

      rows.push([]);
      currentRow += fields.length + 1;
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws["!merges"] = merges;

    ws["!cols"] = [
      { wch: 35 },
      { wch: 18 },
      ...sortedDates.map(() => ({ wch: 15 })),
    ];

    return ws;
  }

  static generateDailyAttendancePieChartOpts(report) {
    return {
      chart: "pie",
      titles: ["Attendance"],
      fields: ["Present", "Absent", "On Leave", "Late"],
      data: {
        Attendance: {
          Present: Number(report.present_count) || 0,
          Absent: Number(report.absent_count) || 0,
          "On Leave": Number(report.on_leave_count) || 0,
          Late: Number(report.late_count) || 0,
        },
      },
    };
  }

  static generateMonthlyAttendanceBarChartOpts(monthlyReport) {
    const data = {};

    monthlyReport.forEach((month) => {
      data[month.month] = {
        Present: Number(month.present_count) || 0,
        Absent: Number(month.absent_count) || 0,
        "On Leave": Number(month.on_leave_count) || 0,
        Late: Number(month.late_count) || 0,
      };
    });

    return {
      chart: "column", // "column" = vertical bars, "bar" = horizontal
      titles: monthlyReport.map((month) => month.month),
      fields: ["Present", "Absent", "On Leave", "Late"],
      data,
    };
  }
}

module.exports = {
  ExcelUtility,
};