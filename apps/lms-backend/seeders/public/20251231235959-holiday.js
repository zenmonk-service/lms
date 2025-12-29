"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const holidayData = [
      {
        date: "2025-01-01",
        day: "Wednesday",
        holiday: "New Year's Day (R)",
        description: "Celebration of the start of a new calendar year",
      },
      {
        date: "2025-01-14",
        day: "Tuesday",
        holiday: "Makar Sankranti (R)",
        description:
          "Hindu festival marking the sun's transition into Capricorn",
      },
      {
        date: "2025-01-26",
        day: "Sunday",
        holiday: "Republic Day (G)",
        description: "Celebrates India's Constitution coming into effect",
      },
      {
        date: "2025-02-12",
        day: "Wednesday",
        holiday: "Guru Ravidas's Birthday (R)",
        description:
          "Birth anniversary of the renowned saint and social reformer",
      },
      {
        date: "2025-02-26",
        day: "Wednesday",
        holiday: "Maha Shivaratri (G)",
        description:
          "Hindu festival dedicated to Lord Shiva, celebrated with prayers and fasting",
      },
      {
        date: "2025-03-13",
        day: "Thursday",
        holiday: "Holika Dahan/Dolyatra (R)",
        description: "Bonfire festival celebrated a day before Holi",
      },
      {
        date: "2025-03-14",
        day: "Friday",
        holiday: "Holi (G)",
        description:
          "Festival of colors celebrating the victory of good over evil",
      },
      {
        date: "2025-03-31",
        day: "Monday",
        holiday: "Idu'l Fitr (G)",
        description:
          "Islamic festival marking the end of Ramadan fasting month",
      },
      {
        date: "2025-04-05",
        day: "Saturday",
        holiday: "Ram Navami (R)",
        description: "Hindu festival celebrating the birth of Lord Rama",
      },
      {
        date: "2025-04-10",
        day: "Thursday",
        holiday: "Mahavir Jayanti (G)",
        description: "Birth anniversary of Mahavira, the founder of Jainism",
      },
      {
        date: "2025-04-18",
        day: "Friday",
        holiday: "Good Friday (G)",
        description:
          "Christian festival commemorating the crucifixion of Jesus Christ",
      },
      {
        date: "2025-04-20",
        day: "Sunday",
        holiday: "Easter Sunday (R)",
        description:
          "Christian festival celebrating the resurrection of Jesus Christ",
      },
      {
        date: "2025-05-12",
        day: "Monday",
        holiday: "Buddha Purnima (G)",
        description:
          "Buddhist festival celebrating the birth of Gautama Buddha",
      },
      {
        date: "2025-06-07",
        day: "Saturday",
        holiday: "Id-ul-Zuha (Bakrid) (G)",
        description: "Islamic festival of sacrifice, also known as Eid al-Adha",
      },
      {
        date: "2025-07-06",
        day: "Sunday",
        holiday: "Muharram (G)",
        description: "Islamic new year and day of remembrance for Shia Muslims",
      },
      {
        date: "2025-08-09",
        day: "Saturday",
        holiday: "Raksha Bandhan (R)",
        description:
          "Hindu festival celebrating the bond between brothers and sisters",
      },
      {
        date: "2025-08-15",
        day: "Friday",
        holiday: "Independence Day (G)",
        description:
          "Celebrates India's independence from British rule in 1947",
      },
      {
        date: "2025-08-16",
        day: "Saturday",
        holiday: "Janmashtami (G)",
        description: "Hindu festival celebrating the birth of Lord Krishna",
      },
      {
        date: "2025-08-27",
        day: "Wednesday",
        holiday: "Vinayaka Chaturthi/Ganesh Chaturthi (R)",
        description: "Hindu festival celebrating the birth of Lord Ganesha",
      },
      {
        date: "2025-09-05",
        day: "Friday",
        holiday: "Onam or Thiru Onam Day (R)",
        description: "Malayali harvest festival celebrated in Kerala",
      },
      {
        date: "2025-10-02",
        day: "Thursday",
        holiday: "Mahatma Gandhi's Birthday (G)",
        description:
          "Birth anniversary of Mahatma Gandhi, the father of the nation",
      },
      {
        date: "2025-10-02",
        day: "Thursday",
        holiday: "Dussehra (Vijaya Dashami) (G)",
        description:
          "Hindu festival celebrating the victory of good over evil, specifically Rama over Ravana",
      },
      {
        date: "2025-10-20",
        day: "Monday",
        holiday: "Diwali (Deepavali) (G)",
        description:
          "Festival of lights celebrating the triumph of light over darkness",
      },
      {
        date: "2025-10-21",
        day: "Tuesday",
        holiday: "Govardhan Puja (R)",
        description:
          "Hindu festival honoring Lord Krishna and the mountain Govardhan",
      },
      {
        date: "2025-10-22",
        day: "Wednesday",
        holiday: "Bhai Duj (R)",
        description:
          "Hindu festival celebrating the bond between brothers and sisters",
      },
      {
        date: "2025-11-05",
        day: "Wednesday",
        holiday: "Gur'u Nanak's Birthday (G)",
        description:
          "Sikh festival celebrating the birth of Guru Nanak, the founder of Sikhism",
      },
      {
        date: "2025-12-24",
        day: "Wednesday",
        holiday: "Christmas Eve (R)",
        description:
          "Christian celebration on the evening before Christmas Day",
      },
      {
        date: "2025-12-25",
        day: "Thursday",
        holiday: "Christmas Day (G)",
        description: "Christian festival celebrating the birth of Jesus Christ",
      },
    ];

    await queryInterface.bulkInsert(
      "holiday",
      holidayData.map((holiday) => ({
        name: holiday.holiday,
        description: holiday.description,
        date_observed: new Date(holiday.date),
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async () => {
      await queryInterface.bulkDelete({ table_name: "holiday" }, {});
    });
  },
};
