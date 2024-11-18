import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import matplotlib.pyplot as plt
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import pandas as pd

# Load your data
df = pd.read_csv("./traffic_data2.csv")

# Encode categorical columns (Day, Time)
label_encoder = LabelEncoder()
df['Day'] = label_encoder.fit_transform(df['Day'])
df['Time'] = label_encoder.fit_transform(df['Time'])

# Encode the target variable 'Volume' (categorical)
volume_encoder = LabelEncoder()
df['Volume'] = volume_encoder.fit_transform(df['Volume'])

# Features and target
X = df[['Day', 'Time', 'Speed']]
print(X)
y = df['Volume']

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Use RandomForestClassifier for classification
model = RandomForestClassifier(n_estimators=100, random_state=20)
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Histogram of residuals
residuals=y_test-y_pred
plt.figure(figsize=(8, 6))
plt.hist(residuals, bins=20, alpha=0.7, color="blue")
plt.axvline(x=0, color='red', linestyle='--', linewidth=2)
plt.xlabel("Residuals")
plt.ylabel("Frequency")
plt.title("Distribution of Residuals")
plt.show()

# Evaluation: Accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f'Accuracy: {accuracy}')

# Predicting for new data (assuming the same features)
new_data = pd.DataFrame({
    'Day': [label_encoder.transform([2])[0]],  # For Day = 2
    'Time': [label_encoder.transform([4])[0]],  # For Time = 14
    'Speed': [31]  # Directly use the numeric value for Speed
})
predicted_traffic = model.predict(new_data)
predicted_traffic_label = volume_encoder.inverse_transform(predicted_traffic)
print(f'Predicted Traffic Volume: {predicted_traffic_label}')

# # Save the model to a .pkl file
# joblib.dump(model, 'model.pkl')
# print("Model saved as model.pkl")