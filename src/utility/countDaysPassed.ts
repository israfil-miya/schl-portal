const countPassedDaysSinceADate = (date: Date): number => {
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - date.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
  return daysDifference;
};

export default countPassedDaysSinceADate;
