/**
 * Адаптер над window.journalAPI.
 */
export const journalService = {
  getByDate: (date: string) => window.journalAPI.getByDate(date),
  getByPeriod: (startDate: string, endDate: string) =>
    window.journalAPI.getByPeriod(startDate, endDate),
  getDoctorNames: () => window.journalAPI.getDoctorNames(),
};