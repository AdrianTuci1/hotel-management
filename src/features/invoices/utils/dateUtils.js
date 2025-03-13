export const formatDate = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toISOString().split('T')[0];
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getDefaultDateRange = () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  return {
    startDate: formatDate(today),
    endDate: formatDate(tomorrow)
  };
};

export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return checkDate >= start && checkDate <= end;
}; 