 class UserAttendanceReportTransformer {
   transform(rows) {
    const groupedAttendance = {};

    rows.forEach((row) => {
      const userId = row.user_id;

      if (!groupedAttendance[userId]) {
        groupedAttendance[userId] = {
          user_uuid: row.user.user_id,
          name: row.user.name,
          avatar_url: row.user.image,
          attendances: [],
        };
      }

      groupedAttendance[userId].attendances.push({
        date: row.date,
        status: row.status,
        check_in: row.check_in,
        check_out: row.check_out,
        working_hours: row.working_hours,
      });
    });

    return Object.values(groupedAttendance);
  }
}

module.exports = UserAttendanceReportTransformer;