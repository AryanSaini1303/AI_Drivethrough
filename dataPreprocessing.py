import pandas as pd

# Create DataFrame
df = pd.read_csv("./traffic_data.csv")

# Convert 'Time' to datetime for easier processing
df['Time'] = pd.to_datetime(df['Time'], format='%H:%M:%S')

# Function to categorize time into the corresponding quarter
def get_time_quarter(time_obj):
    hour = time_obj.hour
    if 0 <= hour < 4:
        return '0-4'
    elif 4 <= hour < 8:
        return '4-8'
    elif 8 <= hour < 12:
        return '8-12'
    elif 12 <= hour < 16:
        return '12-16'
    elif 16 <= hour < 20:
        return '16-20'
    else:
        return '20-24'

# Apply function to categorize time
df['Time_Quarter'] = df['Time'].apply(get_time_quarter)

# Function to convert day of the week to number (1 for Monday, 2 for Tuesday, etc.)
def get_day_number(day_name):
    days = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 7
    }
    return days.get(day_name, None)

# Convert day of the week to day number
df['Day_Number'] = df['Day of the week'].apply(get_day_number)

# Sorting the DataFrame by 'Date', 'Day_Number', and 'Time_Quarter'
df = df.sort_values(by=['Date', 'Day_Number', 'Time_Quarter'])

# Group by 'Time_Quarter', 'Day_Number', and 'Date' and sum the traffic volume ('Total')
grouped_df = df.groupby(['Date', 'Day_Number', 'Time_Quarter'], as_index=False).agg({'Total': 'sum'})

# Save the grouped DataFrame to an Excel file
grouped_df.to_excel('traffic_prediction_data.xlsx', index=False)

# Display the result
print(grouped_df)
