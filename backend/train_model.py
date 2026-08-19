import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from backend.dataset.generate_dataset import generate_cooling_water_dataset

FEATURE_COLUMNS = [
    'gpu_temperature', 'gpu_power_load', 'ambient_temperature', 'humidity',
    'water_temperature', 'tds', 'ph', 'conductivity', 'tower_age',
    'cooling_cycles', 'flow_rate', 'daily_water_usage'
]

def train_and_save_model():
    dataset_dir = os.path.join(os.path.dirname(__file__), 'dataset')
    csv_path = os.path.join(dataset_dir, 'cooling_water_dataset.csv')
    
    if not os.path.exists(csv_path):
        print("Dataset not found. Generating new dataset...")
        df = generate_cooling_water_dataset()
    else:
        df = pd.read_csv(csv_path)
        
    X = df[FEATURE_COLUMNS]
    y = df['scaling_risk']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Train Random Forest Classifier
    rf_clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    rf_clf.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = rf_clf.predict(X_test)
    y_proba = rf_clf.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    
    print("\n--- RANDOM FOREST MODEL EVALUATION METRICS ---")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1 Score:  {f1 * 100:.2f}%")
    print(f"ROC AUC:   {auc * 100:.2f}%")
    print("---------------------------------------------\n")
    
    # Feature Importances
    importances = pd.Series(rf_clf.feature_importances_, index=FEATURE_COLUMNS).sort_values(ascending=False)
    print("Top Feature Importances:")
    print(importances.head(6))
    
    # Save model
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, 'scaling_model.pkl')
    
    model_data = {
        'model': rf_clf,
        'feature_names': FEATURE_COLUMNS,
        'metrics': {
            'accuracy': round(float(acc), 4),
            'precision': round(float(prec), 4),
            'recall': round(float(rec), 4),
            'f1_score': round(float(f1), 4),
            'roc_auc': round(float(auc), 4)
        }
    }
    
    joblib.dump(model_data, model_path)
    print(f"Model saved successfully to {model_path}")
    return model_path

if __name__ == "__main__":
    train_and_save_model()
