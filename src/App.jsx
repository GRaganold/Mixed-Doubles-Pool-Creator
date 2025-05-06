import { useState, useEffect } from "react"
import Papa from "papaparse"
import { WeekSelector } from "./weekSelect"
import Rankings from "./ranking"
import UserInputs from "./userInputs/userInputs"
import "./App.css"

export default function App() {
	const [selectedWeek, setSelectedWeek] = useState(null)
	const [weeks, setWeeks] = useState([])

	useEffect(() => {
		// Fetch the weeks list from the index.json file
		fetch("data/index.json") // Relative path from the public directory
			.then(res => {
				if (!res.ok) {
					throw new Error("Network response was not ok")
				}
				return res.json()
			})
			.then(data => {
				console.log("Fetched weeks data:", data) // Log the response to check the data structure
				setWeeks(data.weeks) // Set the weeks list from the JSON
			})
			.catch(err => {
				console.error("Error loading week list:", err) // Log the error if the fetch fails
			})
	}, [])

	return (
		<>
			<div
				style={{
					maxWidth: "600px", // Maximum width of 400px
					margin: "0 auto", // Center the div horizontally
					padding: "20px", // Add padding for spacing
					textAlign: "center", // Optionally center text
				}}
			>
				<h1>Mixed Doubles Curling Tour Pool Creator</h1>
				<p>
					Welcome to the Ontario Mixed Doubles Curling Tour Pool Creator! This tool allows you to easily organize teams into pools for the competition. Simply input the team names,
					adjust rankings as needed, and let the system do the work to generate balanced pools for your event.
				</p>
				<p>
					<i>
						Rankings are updated every Monday at 9 AM (EST). This application fetches the latest rankings from CurlingZone and saves them according to the corresponding week
						number, aligning with CurlingZone's official curling season schedule.
					</i>
				</p>
				<p>
					<i>
					Rankings will be cleared at the end of each season. Week 0 will represent the rankings prior to the season's commencement.
					</i>
				</p>
			
				<WeekSelector
					weeks={weeks}
					selectedWeek={selectedWeek} // Pass selectedWeek as a prop
					onWeekSelect={setSelectedWeek}
				/>

				{selectedWeek && <Rankings selectedWeek={selectedWeek} />}
				<br />
				{selectedWeek && <UserInputs selectedWeek={selectedWeek} />}
			</div>
		</>
	)
}
