export function WeekSelector({ weeks, selectedWeek, onWeekSelect }) {
  if (weeks.length === 0) {
    return <div>Loading weeks...</div>; // Show loading if no weeks are available
  }

  return (
    <select
      onChange={(e) => onWeekSelect(e.target.value)}
      value={selectedWeek || ""}
    >
      <option value="">Select a week</option>
      {weeks
        .sort((a, b) => b - a) // Sort weeks in descending order
        .map((week) => (
          <option key={week} value={week}>
            Week {week}
          </option>
        ))}
    </select>
  );
}
