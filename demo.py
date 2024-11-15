import pandas as pd
import matplotlib.pyplot as plt

# Load the dataset
df = pd.read_excel("./traffic_data1.xlsx")

# Filter the data where Time_Quarter is 0 and Day_Number is 0
filtered_df = df[(df['Time_Quarter'] == 0) & (df['Day_Number'] == 0)]

# Make sure the Date column is in datetime format
filtered_df['Date'] = pd.to_datetime(filtered_df['Date'], errors='coerce')

# Plotting Date vs Total
plt.figure(figsize=(10, 6))
plt.plot(filtered_df['Date'], filtered_df['Total'], marker='o', linestyle='-', color='b')
plt.xlabel('Date')
plt.ylabel('Total Traffic Volume')
plt.title('Date vs Total Traffic Volume for Time_Quarter = 0 and Day_Number = 0')
plt.xticks(rotation=45)  # Rotate the date labels for better readability
plt.grid(True)
plt.show()