import { useState, useEffect } from "react"
import Papa from "papaparse"

export default function UserInputs({ selectedWeek }) {
	const [data, setData] = useState([])
	const [numTeams, setNumTeams] = useState("")
	const [numPools, setNumPools] = useState("")
	const [inputValues, setInputValues] = useState([])
	const [suggestions, setSuggestions] = useState({}) // FIXED: initialized as object
	const [originalData, setOriginalData] = useState([])


	useEffect(() => {
		if (!selectedWeek) return

		fetch(`data/curling_data_week_${selectedWeek}.csv`)
			.then(res => res.text())
			.then(csvData => {
				Papa.parse(csvData, {
					header: true,
					dynamicTyping: true,
					complete: result => {
						console.log("Parsed CSV data:", result)
						setData(result.data)
						setOriginalData(result.data) // Save a reference to original totals
					},
				})
			})
			.catch(err => {
				console.error("Error fetching or parsing CSV:", err)
			})
	}, [selectedWeek])

	useEffect(() => {
		setInputValues(Array(Number(numTeams) || 0).fill(""))
	}, [numTeams])

	const teamNames = data.map(row => row["Team"]).filter(name => typeof name === "string" && name.trim().length > 0)

	const handleInputChange = (index, value) => {
		const updated = [...inputValues]
		updated[index] = value
		setInputValues(updated)

		if (value.length > 1) {
			const filtered = teamNames.filter(name => name.toLowerCase().includes(value.toLowerCase()))
			setSuggestions(prev => ({ ...prev, [index]: filtered }))
		} else {
			setSuggestions(prev => ({ ...prev, [index]: [] }))
		}
	}

	const handleSuggestionClick = (index, name) => {
		const updated = [...inputValues]
		updated[index] = name
		setInputValues(updated)
		setSuggestions(prev => ({ ...prev, [index]: [] }))
	}

	const handleAddToTotal = teamName => {
		// Increase the total points for the selected team
		const updatedData = data.map(row => {
			if (row["Team"] === teamName) {
				// Example: Add 1 point to the current total
				const newTotal = (row["TOTAL"] || 0) + 1
				return { ...row, TOTAL: newTotal }
			}
			return row
		})
		setData(updatedData)
	}
	const handleSubtractToTotal = teamName => {
		// Increase the total points for the selected team
		const updatedData = data.map(row => {
			if (row["Team"] === teamName) {
				// Example: Add 1 point to the current total
				const newTotal = (row["TOTAL"] || 0) - 1
				return { ...row, TOTAL: newTotal }
			}
			return row
		})
		setData(updatedData)
	}

	const handleResetTotal = teamName => {
		const originalRow = originalData.find(row => row["Team"] === teamName)
		if (!originalRow) return
	
		const updatedData = data.map(row => {
			if (row["Team"] === teamName) {
				return { ...row, TOTAL: originalRow["TOTAL"] }
			}
			return row
		})
		setData(updatedData)
	}
	


	

	return (
		<>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "center",
					gap: "10px",
					marginBottom: "20px",
				}}
			>
				<label>
					Number of teams:
					<select value={numTeams} onChange={e => setNumTeams(Number(e.target.value))}>
						<option value="">Select</option>
						{Array.from({ length: 25 }, (_, i) => i + 8).map(num => (
							<option key={num} value={num}>
								{num}
							</option>
						))}
					</select>
				</label>

				<label>
					Number of pools:
					<select value={numPools} onChange={e => setNumPools(Number(e.target.value))}>
						<option value="">Select</option>
						{Array.from({ length: 7 }, (_, i) => i + 2).map(num => (
							<option key={num} value={num}>
								{num}
							</option>
						))}
					</select>
				</label>
			</div>

			{/* Dynamic team inputs */}
			{inputValues.map((value, index) => (
				<div key={index} style={{ position: "relative", maxWidth: "300px" }}>
					<input type="text" placeholder={`Team ${index + 1}`} value={value} onChange={e => handleInputChange(index, e.target.value)} style={{ width: "100%", padding: "6px" }} />
					{suggestions[index]?.length > 0 && (
						<ul
							style={{
								position: "absolute",
								top: "100%",
								left: 0,
								right: 0,
								background: "#fff",
								border: "1px solid #ccc",
								listStyle: "none",
								margin: 0,
								padding: 0,
								zIndex: 10,
								maxHeight: "150px",
								overflowY: "auto",
							}}
						>
							{suggestions[index].map((name, i) => (
								<li key={i} onClick={() => handleSuggestionClick(index, name)} style={{ padding: "6px", cursor: "pointer" }}>
									{name}
								</li>
							))}
						</ul>
					)}
				</div>
			))}

			<div style={{ marginTop: "30px", padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}>
				<h4>Selected Team Rankings by TOTAL:</h4>
				{inputValues
					.map(name => {
						// Find the team in the data
						const team = data.find(row => row["Team"] === name)

						// If not found, mark the team as "Unranked"
						if (!team) {
							return { Team: name, TOTAL: "Unranked" } // Add Unranked status for missing teams
						}

						return team
					})
					.filter(row => row && !isNaN(Number(row["TOTAL"])))
					.sort((a, b) => {
						// Sort teams by their TOTAL value
						const totalA = a["TOTAL"] === "Unranked" ? -1 : Number(a["TOTAL"])
						const totalB = b["TOTAL"] === "Unranked" ? -1 : Number(b["TOTAL"])
						return totalB - totalA // Sort in descending order
					})
					.map((row, index) => (
						<div key={index} >
						<p>#{index + 1} – {row["Team"]}: {row["TOTAL"]}
							<span style={{ marginRight: "5px" }}> </span>
						<button onClick={() => handleAddToTotal(row.Team)} style={{ marginRight: "5px" }}>+</button>
						<button onClick={() => handleSubtractToTotal(row.Team)} style={{ marginRight: "5px" }}>-</button>
						<button onClick={() => handleResetTotal(row.Team)} style={{ marginRight: "5px" }}>Reset</button>
						</p>
					</div>
					))}
			</div>

			{numPools > 0 && inputValues.length > 0 && (
				<div style={{ marginTop: "30px", padding: "10px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
					<h4 style={{ textAlign: "center", fontWeight: "bold", color: "#333" }}>Snake-Ordered Pools</h4>
					{(() => {
						// Get the selected teams and sort them by TOTAL in descending order
						const selectedTeams = inputValues
							.map(name => data.find(row => row["Team"] === name))
							.filter(row => row && !isNaN(Number(row["TOTAL"])))
							.sort((a, b) => Number(b["TOTAL"]) - Number(a["TOTAL"]))

						// Initialize empty pools
						const pools = Array.from({ length: numPools }, () => [])

						// Create the snake order distribution (start with normal, then reverse for snake)
						let poolIndex = 0
						let reverse = false

						selectedTeams.forEach(team => {
							// Assign the team to the current pool
							pools[poolIndex].push(team)

							// After adding a team, decide the next pool to add to
							if (!reverse) {
								if (poolIndex === numPools - 1) {
									reverse = true
								} else {
									poolIndex++
								}
							} else {
								if (poolIndex === 0) {
									reverse = false
								} else {
									poolIndex--
								}
							}
						})

						// Display the pools with rankings beside the team names
						return (
							<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
								{pools.map((pool, poolIndex) => (
									<div
										key={poolIndex}
										style={{
											border: "1px solid #ddd",
											padding: "5px",
											borderRadius: "10px",
											backgroundColor: "#fff",
											width: "250px",
											boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
											textAlign: "center",
										}}
									>
										<h5
											style={{
												fontSize: "1.2em",
												fontWeight: "bold",
												color: "#555",
												marginBottom: "15px",
											}}
										>
											Pool {String.fromCharCode(65 + poolIndex)}
										</h5>
										{pool.map((team, i) => (
											<p
												key={i}
												style={{
													fontSize: "1em",
													fontWeight: "500",
													color: "#333",
													marginBottom: "10px",
													lineHeight: "1.5",
													textAlign: "left",
												}}
											>
												#
												<span
													style={{
														fontWeight: "bold",
														color: "#007BFF",
													}}
												>
													{selectedTeams.indexOf(team) + 1}. &nbsp;
												</span>
												<span
													style={{
														fontWeight: "bold",
														color: "#222",
													}}
												>
													{team["Team"]}
												</span>
											</p>
										))}
									</div>
								))}
							</div>
						)
					})()}
				</div>
			)}
			
		</>
	)
}
