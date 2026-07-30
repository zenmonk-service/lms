const { DayStatus } = require("../models/tenants/organization/enum/day-status-enum");
const { holidayRepository } = require("../repositories/holiday-repository");
const axios = require('axios');


exports.getFilteredHolidays = async (payload) => {
  let { year = new Date().getFullYear(),start_date, end_date, order, order_column } = payload.query;

  let holidays;

    holidays = await holidayRepository.getFilteredHolidays(
      { year, start_date, end_date },
      { order_type: order, order_column }
    );

    if (holidays && holidays.rows.length > 0) {
    return holidays;
  }

  const response = await axios.get(process.env.HOLIDAY_API_BASE_URL, {
    params: {
      api_key: process.env.HOLIDAY_API_KEY,
      country: process.env.COUNTRY_CODE,
      year,
    },
  });

  const updated_holidays = response.data.response.holidays.map((holiday) => {
    const date = new Date(holiday.date.iso);

    const start_date = new Date(date);
    start_date.setHours(0, 0, 0, 0);

    const end_date = new Date(date);
    end_date.setHours(23, 59, 59, 999);

    return {
      title: holiday.name,
      description: holiday.description || '',
      start_date,
      end_date,
      day_status: DayStatus.ENUM.PUBLIC_HOLIDAY,
    };
  });

  await holidayRepository.createBulkHolidays(updated_holidays);
  return holidayRepository.getFilteredHolidays(
    { year, start_date, end_date },
    { order_type: order, order_column }
  );
};