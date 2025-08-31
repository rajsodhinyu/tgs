require("dotenv").config();

module.exports = {
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID || "fnvy29id",
    dataset: process.env.SANITY_DATASET || "tgs",
    token: process.env.SANITY_TOKEN,
    apiVersion: "2023-05-03",
    useCdn: false,
  },
  import: {
    startDate: "2025-08-30T23:27:24Z", // Starting date for releases
    releaseTimeOfDay: "12:00", // Time of day for each release (8am)
    daysInterval: 1, // Release one song per day
  },
};
