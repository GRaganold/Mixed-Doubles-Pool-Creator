from datetime import datetime, timedelta

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

# Output
print(f"Start week: {season_start.strftime('%Y-%m-%d')}")
print(f"Current week: Week {current_week}")
print(f"Current week - 2: Week {max(1, current_week - 2)}")
