import { useState,useEffect } from "react"
import Papa from "papaparse"

export default function Rankings({ selectedWeek }) {
	const [data, setData] = useState([])

	useEffect(() => {
		// Fetch the CSV data based on the selected week
		fetch(`data/curling_data_week_${selectedWeek}.csv`)
			.then(res => res.text())
			.then(csvData => {
				// Parse CSV using papaparse
				Papa.parse(csvData, {
					header: true, // This will treat the first row as headers and use it for key mapping
					dynamicTyping: true, // Automatically convert numbers to their proper types (e.g., number strings to numbers)
					complete: result => {
						console.log("Parsed CSV data:", result)
						setData(result.data) // Set the parsed data
					},
				})
			})
			.catch(err => {
				console.error("Error fetching or parsing CSV:", err)
			})
	}, [selectedWeek]) // Fetch new data every time the selectedWeek changes

	const tableHeaderStyle = {
		backgroundColor: "#007BFF",
		color: "#fff",
		padding: "8px 12px",
		textAlign: "left",
		position: "sticky", // Make the header sticky
		top: 0, // Stick to the top of the container
		zIndex: 1, // Ensure the header stays above the table rows
	}

	const tableCellStyle = {
		padding: "8px 12px",
		border: "1px solid #ddd",
		color: "#333",
	}

	const rowStyleEven = {
		backgroundColor: "#f9f9f9",
	}

	const rowStyleOdd = {
		backgroundColor: "#fff",
	}

	return (
		<div>
			<h2>Rankings for Week {selectedWeek}</h2>
			<div style={{ height: "300px", overflowY: "auto" }}>
				<table style={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<th style={tableHeaderStyle}>Rank</th>
							<th style={tableHeaderStyle }>Team</th>
							<th style={tableHeaderStyle}>Location</th>
							<th style={tableHeaderStyle}>YTD</th>
							<th style={tableHeaderStyle}>TOTAL</th>
						</tr>
					</thead>
					<tbody>
						{data.map((row, index) => (
							<tr key={index} style={index % 2 === 0 ? rowStyleEven : rowStyleOdd}>
								<td style={tableCellStyle}>{row["Rank"]}</td>
								<td style={{ ...tableCellStyle, textAlign: "left" }}>{row["Team"]}</td>
								<td style={tableCellStyle}>{row["Location"]}</td>
								<td style={tableCellStyle}>{row["YTD"]}</td>
								<td style={tableCellStyle}>{row["TOTAL"]}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}