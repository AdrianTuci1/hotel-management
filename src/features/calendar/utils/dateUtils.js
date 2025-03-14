export function generateDatesArray(startDate, endDate) {
  const dates = [];
  let current = new Date(startDate);
  while (current <= new Date(endDate)) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function isDateRangeOverlapping(start1, end1, start2, end2) {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  return s1 < e2 && s2 < e1;
}

export function getNextTwoWeeks() {
  const today = new Date();
  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(today.getDate() + 14);
  
  return {
    startDate: today.toISOString().split('T')[0],
    endDate: twoWeeksLater.toISOString().split('T')[0]
  };
}

export function formatDate(date) {
  return date.toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit" });
}

export function isDateInRange(date, startDate, endDate) {
  const currentDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Ajustăm end date pentru a include și ultima zi
  end.setDate(end.getDate() - 1);

  // Setăm timpul la miezul nopții pentru comparație corectă
  currentDate.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return currentDate >= start && currentDate <= end;
} 