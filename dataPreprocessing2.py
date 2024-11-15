import pandas as pd

# Create DataFrame
df=pd.read_excel("./traffic_prediction_data.xlsx")

# Define a custom sort order for 'Time_Quarter'
time_order = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24']

# Create a new column 'Time_Quarter_Order' to help sort the data
df['Time_Quarter_Order'] = pd.Categorical(df['Time_Quarter'], categories=time_order, ordered=True)

# Sort the DataFrame by 'Date', 'Day_Number', and 'Time_Quarter_Order'
df_sorted = df.sort_values(by=['Date', 'Day_Number', 'Time_Quarter_Order'])

# Drop the 'Time_Quarter_Order' column as it's no longer needed
df_sorted = df_sorted.drop(columns=['Time_Quarter_Order'])

# Save the sorted DataFrame to an Excel file
df_sorted.to_excel('sorted_traffic_prediction_data.xlsx', index=False)

# Display the sorted DataFrame
print(df_sorted)
