import { useState, useEffect } from "react";

export default function App() {
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
    // Fetch the weeks list from the index.json file
    fetch("/data/index.json")
      .then((res) => res.json())
      .then((data) => setWeeks(data.weeks))
      .catch((err) => console.error("Error loading week list:", err));
  }, []);

  return (
    <>
      <WeekSelector
        weeks={weeks}
        selectedWeek={selectedWeek} // Pass selectedWeek as a prop
        onWeekSelect={setSelectedWeek}
      />
      {selectedWeek && <Rankings weekFile={`curling_data_week_${selectedWeek}.csv`} />}
    </>
  );
}

function WeekSelector({ weeks, selectedWeek, onWeekSelect }) {
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
