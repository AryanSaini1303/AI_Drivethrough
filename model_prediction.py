import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import matplotlib.pyplot as plt
import joblib

# Load the dataset
df = pd.read_excel("./traffic_data1.xlsx")

# Encoding the categorical features
label_encoder = LabelEncoder()
df['Day_Number'] = label_encoder.fit_transform(df['Day_Number'])
df['Time_Quarter'] = label_encoder.fit_transform(df['Time_Quarter'])

X = df[['Time_Quarter', 'Day_Number']]  # Independent variables
y = df['Volume']  # Dependent variable

# Splitting the data into training and testing sets (80-20 split)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialising Random Forest Model
model = RandomForestRegressor(n_estimators=100, random_state=20)
# from sklearn.tree import DecisionTreeRegressor
# model = DecisionTreeRegressor(random_state=42)

# Train the model
model.fit(X_train, y_train)

# Predict on the basis of test set
y_pred = model.predict(X_test)

# Evaluate the model
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

# print(f'Mean Absolute Error: {mae}')
# print(f'Mean Squared Error: {mse}')
print(f'R² Score: {r2}')

# # Histogram of residuals
# residuals=y_test-y_pred
# plt.figure(figsize=(8, 6))
# plt.hist(residuals, bins=20, alpha=0.7, color="blue")
# plt.axvline(x=0, color='red', linestyle='--', linewidth=2)
# plt.xlabel("Residuals")
# plt.ylabel("Frequency")
# plt.title("Distribution of Residuals")
# plt.show()

# Bar plot for actual vs predicted comparison
plt.figure(figsize=(10, 6))
plt.bar(range(len(y_test)), y_test, label="Actual", alpha=0.7, color="blue")
plt.bar(range(len(y_pred)), y_pred, label="Predicted", alpha=0.7, color="orange")
plt.legend()
plt.xlabel("Test Samples")
plt.ylabel("Traffic Volume")
plt.title("Actual vs Predicted Traffic Volume (Bar Plot)")
plt.show()

# Predicting for new data
new_data = pd.DataFrame({
    'Time_Quarter': [label_encoder.transform([0])[0]],
    # 'Date':[label_encoder.transform([2])[0]],
    'Day_Number': [label_encoder.transform([0])[0]]   
})
predicted_traffic = model.predict(new_data)
# print(f'Predicted Traffic Situation for the new data: {round(predicted_traffic[0],0)}')
level='low'
if round(predicted_traffic[0],0)==0:
    level='Low'
elif round(predicted_traffic[0],0)==1:
    level='Medium'
elif round(predicted_traffic[0],0)==2:
    level='High'
else:
    level='Heavy'
print("The Predicted Traffic Density is",level)

# Save the model to a .pkl file
joblib.dump(model, 'model.pkl')
print("Model saved as model.pkl")
