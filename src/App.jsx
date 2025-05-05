import React, { useState } from "react";

function App() {
  const [week, setWeek] = useState("");
  const [status, setStatus] = useState("");

  const handleScrape = async () => {
    if (!week || isNaN(week)) {
      alert("Please enter a valid week number.");
      return;
    }

    setStatus("Scraping...");

    try {
      const response = await fetch(`http://localhost:5000/scrape?week=${week}`);
      const data = await response.json();

      if (response.ok) {
        // Optionally save the file or just log the data
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `curlingzone_week_${week}.json`;
        link.click();

        setStatus("Download complete!");
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>CurlingZone Scraper</h2>
      <label>
        Enter Week Number:
        <input type="number" value={week} onChange={(e) => setWeek(e.target.value)} />
      </label>
      <button onClick={handleScrape}>Scrape and Download</button>
      <p>{status}</p>
    </div>
  );
}

export default App;
