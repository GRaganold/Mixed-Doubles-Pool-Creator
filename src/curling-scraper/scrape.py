import os
import requests
import pandas as pd
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

# Get the current year dynamically
current_year = datetime.today().year

# Function to find the first Monday of August
def get_first_monday_of_august(year):
    """Returns the date of the first Monday of August for a given year."""
    august_1st = datetime(year, 8, 1)
    days_to_add = (7 - august_1st.weekday()) % 7
    return august_1st + timedelta(days=days_to_add)

# Get today's date
today = datetime.today()

# Get the first Monday of August for this year
season_start = get_first_monday_of_august(today.year)

# If today is before the season starts, use the previous year's season start
if today < season_start:
    season_start = get_first_monday_of_august(today.year - 1)

# Calculate current week number
days_since_start = (today - season_start).days
current_week = (days_since_start // 7) + 1  # Week 1 starts at 0–6 days after start

# Folder to save data
data_folder = os.path.join(os.path.dirname(__file__), '../../public/data/')

# Ensure the /public/data/ folder exists
if not os.path.exists(data_folder):
    os.makedirs(data_folder)

# Function to scrape data and save it as CSV for a specific week
def scrape_and_save(week):
    try:
        # Construct the URL dynamically
        url = f"https://www.curlingzone.com/rankings.php?task=week&oomid=85&eventyear={current_year}&week={week}#1"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        # Request the page
        response = requests.get(url, headers=headers)
        
        # Check if the page exists (status code 200)
        if response.status_code != 200:
            print(f"Week {week}: URL does not exist or failed to load.")
            return

        # Parse the HTML
        soup = BeautifulSoup(response.text, "html.parser")

        # Find the table
        table = soup.find("table", class_="rwd-table")

        if not table:
            print(f"Week {week}: Error - Table not found on the webpage!")
            return

        header_row = table.find("tr")
        headers = [th.get_text(strip=True) for th in header_row.find_all("th")]

        if len(headers) > 5:
            headers = ["Rank", "Team", "Location", "YTD", "Total"]

        data = []
        for row in table.find_all("tr")[1:]:
            cells = row.find_all("td")
            if len(cells) >= 6:
                rank = cells[0].text.strip()
                team = cells[2].text.strip()
                location = cells[3].text.strip()
                ytd = cells[4].text.strip()
                total = cells[5].text.strip()
                data.append([rank, team, location, ytd, total])

        if not data:
            print(f"Week {week}: Error - No data rows extracted from the table.")
            return

        file_path = os.path.join(data_folder, f"curling_data_week_{week}.csv")
        df = pd.DataFrame(data, columns=headers)
        df.to_csv(file_path, index=False)

        print(f"Week {week}: Data successfully saved to {file_path}")

    except requests.exceptions.RequestException as e:
        print(f"Week {week}: Request failed - {e}")
    except Exception as e:
        print(f"Week {week}: An error occurred - {e}")

# Run the function to scrape and save the data for the current week
scrape_and_save(current_week)
