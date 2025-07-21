import { useState, useEffect } from "react"
import Papa from "papaparse"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver" // you'll need this too

export default function UserInputs({ selectedWeek }) {
	const [data, setData] = useState([])
	const [numTeams, setNumTeams] = useState(null)
	const [numPools, setNumPools] = useState(null)
	const [inputValues, setInputValues] = useState([])
	const [suggestions, setSuggestions] = useState({}) // FIXED: initialized as object
	const [originalData, setOriginalData] = useState([])
	const [customTeams, setCustomTeams] = useState([{}])
	const [customTeamName, setCustomTeamName] = useState("")
	const [inputTotals, setInputTotals] = useState({})

	useEffect(() => {
		if (!selectedWeek) return

		fetch(`data/curling_data_week_${selectedWeek}.csv`)
			.then(res => res.text())
			.then(csvData => {
				Papa.parse(csvData, {
					header: true,
					dynamicTyping: true,
					complete: result => {
						// console.log("Parsed CSV data:", result)
						setData(result.data)
						setOriginalData(result.data) // Save a reference to original totals
					},
				})
			})
			.catch(err => {
				console.error("Error fetching or parsing CSV:", err)
			})
	}, [selectedWeek, setOriginalData])

	useEffect(() => {
		setInputValues(prevValues => {
			const newLength = Number(numTeams) || 0
			const updated = [...prevValues]
			while (updated.length < newLength) updated.push("")
			return updated.slice(0, newLength)
		})
	}, [numTeams])

	useEffect(() => {
		// Initialize inputTotals with the current TOTAL values from row data
		const initialTotals = {}
		data.forEach(row => {
			initialTotals[row.Team] = row.TOTAL
		})
		setInputTotals(initialTotals)
	}, [data]) // Re-run when data changes

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

	const handleChangeTotal = (teamName, newTotal) => {
		const updatedData = data.map(row => {
			if (row["Team"] === teamName) {
				return { ...row, TOTAL: newTotal }
			}
			return row
		})
		setData(updatedData)
	}

	const handleAddCustomTeam = teamName => {
		// Check if the team already exists
		if (!teamName || customTeams.some(team => team.name === teamName)) return

		const newTeam = {
			Team: teamName,
			TOTAL: 0, // Starting points
			Ranking: 100 + customTeams.length, // Custom ranking based on the index
		}
		setCustomTeams([...customTeams, newTeam])
		setData([...data, newTeam]) // Add custom team to the data
	}

	return (
		<>
			<h2> Event Details</h2>
			<p className="instruction">Enter the number of teams in your event and the of pools</p>
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
					<select
						value={numTeams}
						onChange={e => {
							const value = e.target.value
							setNumTeams(value === "" ? null : Number(value))
						}}
					>
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
					<select
						value={numPools}
						onChange={e => {
							const value = e.target.value
							setNumPools(value === "" ? null : Number(value))
						}}
					>
						<option value="">Select</option>
						{Array.from({ length: 7 }, (_, i) => i + 2).map(num => (
							<option key={num} value={num}>
								{num}
							</option>
						))}
					</select>
				</label>
			</div>

			<div>
				<input type="text" placeholder="Enter Custom Team Name" value={customTeamName} onChange={e => setCustomTeamName(e.target.value)} style={{ margin: "8px" }} />
				<button
					onClick={() => {
						handleAddCustomTeam(customTeamName)
						setCustomTeamName("") // Clear input
					}}
				>
					Add Custom Team
				</button>
			</div>

			{numTeams !== null && numPools !== null && (
				<>
					<div>
						<h3> Enter Registers teams information </h3>
						<p className="instruction">
							For each input, enter the team name. A dropdown will appear to help you auto-complete and select the team. Once selected, the team will be added to the list below.
						</p>
						{/* Dynamic team inputs */}

						<small style={{ color: "#666", display: "block", marginTop: "4px" }}>Start typing to see suggestions</small>
						<small
							style={{
								color: "#666",
								display: "block",
								marginTop: "4px",
								marginBottom: "4px",
							}}
						>
							Click on the suggestion to select the team
						</small>

						{inputValues.map((value, index) => (
							<div key={index} style={{ position: "relative", maxWidth: "300px" }}>
								<input
									className="registeredTeams"
									type="text"
									placeholder={`Team ${index + 1}`}
									value={value}
									onChange={e => handleInputChange(index, e.target.value)}
									style={{
										width: "100%",
										padding: "6px",
										paddingRight: "30px",
									}}
								/>
								{suggestions[index]?.length > 0 && (
									<ul
										style={{
											position: "absolute",
											top: "100%",
											left: 0,
											right: 0,
											background: "#fff",
											border: "1px solid #ccc",
											boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
											listStyle: "none",
											margin: 0,
											padding: "2px 0",
											zIndex: 10,
											maxHeight: "200px",
											overflowY: "auto",
											borderRadius: "0 0 6px 6px",
										}}
									>
										{suggestions[index].map((name, i) => (
											<li
												key={i}
												onClick={e => {
													if (inputValues.includes(name)) {
														e.preventDefault() // Prevent the click if the name is already in inputValues
														return
													}
													handleSuggestionClick(index, name) // Proceed with the regular click handler if not disabled
												}}
												style={{
													padding: "8px 12px",
													cursor: inputValues.includes(name) ? "not-allowed" : "pointer", // Disable the pointer if the name is in inputValues
													backgroundColor: inputValues.includes(name) ? "#f0f0f0" : "#fff", // Change the background to a light gray if disabled
													borderBottom: "1px solid #eee",
													transition: "background 0.2s",
													opacity: inputValues.includes(name) ? 0.5 : 1, // Make it appear faded if disabled
												}}
												onMouseEnter={e => !inputValues.includes(name) && (e.currentTarget.style.backgroundColor = "#007bff")} // Blue background on hover, only if not disabled
												onMouseLeave={e => !inputValues.includes(name) && (e.currentTarget.style.backgroundColor = "#fff")} // Reset if not disabled
											>
												{name}
											</li>
										))}
									</ul>
								)}
							</div>
						))}

						<h2>Ranking for the Event</h2>
						<p className="instruction">
							The teams entered above will be ranked based on the selected week's world rankings. You can add or subtract points as needed—use a one (1) point adjustment to break
							ties. Teams will then be snake-ordered into the selected number of pools.
						</p>

						<div
							style={{
								marginTop: "30px",
								padding: "10px",
								border: "1px solid #ccc",
								borderRadius: "8px",
								background: "#f9f9f9",
								boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
							}}
						>
							<h4>Selected Team Rankings by TOTAL:</h4>
							<small>
								If you need to adjust a team's total, you can either use the arrows in the input field or manually enter the new amount. Once you're satisfied with the change,
								click the 'Submit' button to save it. If you wish to reset the team's total, simply click the 'Reset' button, and it will return the total to the value for the
								selected week.
							</small>
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
									<div
										key={index}
										style={{
											display: "flex",
											alignItems: "center",
											marginBottom: "8px",
										}}
									>
										{/* Left Side: Index, Team, Total */}
										<div
											style={{
												flex: "1",
												minWidth: "55%",
												fontWeight: "bold",
												textAlign: "left",
											}}
										>
											#{index + 1} - {row["Team"]}: {row["TOTAL"]}
										</div>

										{/* Right Side: Controls */}
										<div
											style={{
												display: "flex",
												flex: 1,
												alignItems: "center",
												justifyContent: "center",
												gap: "5px",
												padding: "5px",
											}}
										>
											<input
												type="number"
												value={inputTotals[row.Team] ?? row.TOTAL}
												onChange={e =>
													setInputTotals(prev => ({
														...prev,
														[row.Team]: e.target.value,
													}))
												}
												style={{
													width: "100px",
													height: "30px",
													textAlign: "center",
													fontSize: "0.9rem",
													boxSizing: "border-box",
												}}
											/>
											<button
												onClick={() => {
													handleChangeTotal(row.Team, Number(inputTotals[row.Team]))
												}}
												style={{
													height: "28px",
													fontSize: "0.8rem",
													padding: "0 6px",
												}}
											>
												Submit
											</button>
											<button
												onClick={() => {
													const originalRow = originalData.find(r => r.Team === row.Team)
													if (originalRow) {
														setInputTotals(prev => ({
															...prev,
															[row.Team]: originalRow.TOTAL,
														}))
														handleChangeTotal(row.Team, originalRow.TOTAL)
													}
												}}
												style={{
													height: "28px",
													fontSize: "0.8rem",
													padding: "0 6px",
												}}
											>
												Reset
											</button>
										</div>
									</div>
								))}
						</div>
						{numPools > 0 && inputValues.length > 0 && (
							<div
								style={{
									marginTop: "30px",
									padding: "10px",
									border: "1px solid #ccc",
									borderRadius: "8px",
									backgroundColor: "#f9f9f9",
								}}
							>
								<h4
									style={{
										textAlign: "center",
										fontWeight: "bold",
										color: "#333",
									}}
								>
									Snake-Ordered Pools
								</h4>

								{(() => {
									// Get the selected teams and sort them by TOTAL in descending order
									const selectedTeams = inputValues
										.map(name => data.find(row => row["Team"] === name))
										.filter(row => row && !isNaN(Number(row["TOTAL"])))
										.sort((a, b) => Number(b["TOTAL"]) - Number(a["TOTAL"]))

									// Initialize empty pools
									const pools = Array.from({ length: numPools }, () => [])

									selectedTeams.forEach((team, i) => {
										const round = Math.floor(i / numPools)
										const direction = round % 2 === 0 ? 1 : -1
										const poolIndex = direction === 1 ? i % numPools : numPools - 1 - (i % numPools)
										pools[poolIndex].push(team)
									})

									const exportPoolsToExcel = pools => {
										const workbook = new ExcelJS.Workbook()

										// Create "All Teams" sheet, sorted by TOTAL descending
										const allTeams = pools.flat().sort((a, b) => Number(b["TOTAL"]) - Number(a["TOTAL"]))

										const allSheet = workbook.addWorksheet("All Teams")
										allSheet.columns = [
											{ header: "Rank", key: "rank", width: 15 },
											{ header: "Team", key: "team", width: 30 },
											{ header: "Total", key: "total", width: 10 },
										]

										allTeams.forEach((team, index) => {
											allSheet.addRow({
												rank: index + 1,
												team: team["Team"],
												total: team["TOTAL"],
											})
										})
										// Add individual pool sheets
										pools.forEach((pool, i) => {
											const sheet = workbook.addWorksheet(`Pool ${String.fromCharCode(65 + i)}`)

											sheet.columns = [
												{ header: "Rank", key: "rank", width: 10 },
												{ header: "Team", key: "team", width: 30 },
												{ header: "Total", key: "total", width: 10 },
											]

											pool.forEach((team, index) => {
												sheet.addRow({
													rank: index + 1,
													team: team["Team"],
													total: team["TOTAL"],
												})
											})
										})

										// Trigger download
										workbook.xlsx.writeBuffer().then(buffer => {
											const blob = new Blob([buffer], {
												type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
											})
											saveAs(blob, "SnakePools.xlsx")
										})
									}
									const isDownloadDisabled = inputValues.length === 0 || inputValues.some(name => !name || name.trim() === "")

									// 🌟 Here's how you stringify and log/export the result
									// const jsonOutput = JSON.stringify(pools, null, 2)
									// console.log(jsonOutput) // for dev tools

									return (
										<>
											<div
												style={{
													display: "flex",
													gap: "10px",
													flexWrap: "wrap",
													justifyContent: "center",
												}}
											>
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
																<span style={{ fontWeight: "bold", color: "#222" }}>{team["Team"]}</span>
															</p>
														))}
													</div>
												))}
											</div>
											<button
												onClick={() => exportPoolsToExcel(pools)}
												disabled={isDownloadDisabled}
												style={{
													marginTop: "20px",
													opacity: isDownloadDisabled ? 0.5 : 1,
													cursor: isDownloadDisabled ? "not-allowed" : "pointer",
												}}
											>
												Download Excel
											</button>
										</>
									)
								})()}
							</div>
						)}
					</div>
					{/* {JSON.stringify (inputValues, null ,2)} */}
				</>
			)}
		</>
	)
}
