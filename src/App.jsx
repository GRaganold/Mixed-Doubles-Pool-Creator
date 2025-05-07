import { useState, useEffect } from "react";
import { WeekSelector } from "./weekSelect";
import Rankings from "./ranking";
import UserInputs from "./userInputs/userInputs";
import "./App.css";

export default function App() {
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [visible, setVisible] = useState(false); // This controls when components are shown

  useEffect(() => {
    // Load list of weeks
    fetch("data/index.json")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setWeeks(data.weeks))
      .catch((err) => console.error("Error loading week list:", err));
  }, []);

  useEffect(() => {
    if (selectedWeek) {
      setVisible(false); // Immediately hide components

      const timer = setTimeout(() => {
        setVisible(true); // Show them after 0.8s
      }, 650);

      return () => clearTimeout(timer);
    }
  }, [selectedWeek]);

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1>Mixed Doubles Curling Tour Pool Creator</h1>
      <p>
        Welcome to the Ontario Mixed Doubles Curling Tour Pool Creator! This
        tool allows you to easily organize teams into pools for the competition.
        Simply input the team names, adjust rankings as needed, and let the
        system do the work to generate balanced pools for your event.
      </p>
      <p>
        <i>
          Rankings are updated every Monday at 9 AM (EST). This application
          fetches the latest rankings from CurlingZone and saves them according
          to the corresponding week number, aligned with CurlingZone’s season
          schedule.
        </i>
      </p>
      <p>
        <i>
          Rankings will be cleared at the end of each season. Week 0 represents
          pre-season standings.
        </i>
      </p>

      <WeekSelector
        weeks={weeks}
        selectedWeek={selectedWeek}
        onWeekSelect={setSelectedWeek}
      />

      {/* Show loading animation while delaying the reveal */}
      {selectedWeek && !visible && <div className="spinner" />}

      {selectedWeek && visible && (
        <>
          <Rankings selectedWeek={selectedWeek} />
          <br />
          <UserInputs selectedWeek={selectedWeek} />
        </>
      )}
    </div>
  );
}
