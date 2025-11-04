import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from scipy.stats import randint, uniform
import warnings
warnings.filterwarnings('ignore')

# Partie 1 : Préparation et Analyse des Données
# 1. Import du jeu de données
# Note: Remplacez 'votre_fichier.csv' par le nom de votre fichier de données
df = pd.read_csv('votre_fichier.csv')

# 2. Affichage des dimensions et analyse descriptive
print("Dimensions du jeu de données:", df.shape)
print("\nStatistiques descriptives:")
print(df.describe())

# 3. Création des graphiques
plt.figure(figsize=(15, 10))

# Histogrammes pour les variables numériques
plt.subplot(2, 2, 1)
for col in df.select_dtypes(include=[np.number]).columns:
    plt.hist(df[col], alpha=0.5)
plt.title('Histogrammes des variables numériques')

# Boîtes à moustaches
plt.subplot(2, 2, 2)
df.boxplot()
plt.title('Boîtes à moustaches')

# Graphique en secteur pour les variables catégorielles
plt.subplot(2, 2, 3)
for col in df.select_dtypes(include=['object']).columns:
    df[col].value_counts().plot(kind='pie', autopct='%1.1f%%')
    plt.title(f'Distribution de {col}')
    plt.show()

plt.tight_layout()
plt.show()

# 4. Séparation train/test
X = df.drop('target', axis=1)  # Remplacez 'target' par le nom de votre variable cible
y = df['target']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# 5. Pipeline de prétraitement
# Identification des colonnes numériques et catégorielles
numeric_features = X.select_dtypes(include=['int64', 'float64']).columns
categorical_features = X.select_dtypes(include=['object']).columns

# Création du pipeline
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='ffill')),  # Remplacement par la valeur précédente
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='ffill')),
    ('encoder', LabelEncoder())
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# Application du pipeline
X_train_processed = preprocessor.fit_transform(X_train)
X_test_processed = preprocessor.transform(X_test)

print("\nRésultats du prétraitement:")
print("Forme des données d'entraînement après prétraitement:", X_train_processed.shape)
print("Forme des données de test après prétraitement:", X_test_processed.shape)

# Partie 2 : Implémentation et Entraînement des Modèles
# 1. Arbre de Décision
dt = DecisionTreeClassifier(random_state=42)
dt.fit(X_train_processed, y_train)
dt_pred = dt.predict(X_test_processed)

# 2. Forêt Aléatoire
rf = RandomForestClassifier(random_state=42)
rf.fit(X_train_processed, y_train)
rf_pred = rf.predict(X_test_processed)

# 3. AdaBoost avec Arbre de Décision
ada_dt = AdaBoostClassifier(base_estimator=DecisionTreeClassifier(), random_state=42)
ada_dt.fit(X_train_processed, y_train)
ada_dt_pred = ada_dt.predict(X_test_processed)

# 4. AdaBoost avec KNN
knn = KNeighborsClassifier()
ada_knn = AdaBoostClassifier(base_estimator=knn, random_state=42)
ada_knn.fit(X_train_processed, y_train)
ada_knn_pred = ada_knn.predict(X_test_processed)

# Partie 3 : Évaluation des Modèles
def evaluate_model(y_true, y_pred, model_name):
    print(f"\nMétriques pour {model_name}:")
    print(f"Accuracy: {accuracy_score(y_true, y_pred):.4f}")
    print(f"Precision: {precision_score(y_true, y_pred, average='weighted'):.4f}")
    print(f"Recall: {recall_score(y_true, y_pred, average='weighted'):.4f}")
    print(f"F1-score: {f1_score(y_true, y_pred, average='weighted'):.4f}")
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(confusion_matrix(y_true, y_pred), annot=True, fmt='d', cmap='Blues')
    plt.title(f'Matrice de confusion - {model_name}')
    plt.show()

# Évaluation de tous les modèles
evaluate_model(y_test, dt_pred, "Arbre de Décision")
evaluate_model(y_test, rf_pred, "Forêt Aléatoire")
evaluate_model(y_test, ada_dt_pred, "AdaBoost avec Arbre de Décision")
evaluate_model(y_test, ada_knn_pred, "AdaBoost avec KNN")

# Partie 4 : Optimisation des modèles
# 1. Définition des paramètres pour RandomizedSearchCV
dt_params = {
    'max_depth': randint(3, 20),
    'min_samples_split': randint(2, 10),
    'min_samples_leaf': randint(1, 5)
}

rf_params = {
    'n_estimators': randint(100, 500),
    'max_depth': randint(3, 20)
}

ada_params = {
    'n_estimators': randint(50, 200),
    'learning_rate': uniform(0.01, 0.3)
}

# 2. Optimisation avec RandomizedSearchCV
dt_search = RandomizedSearchCV(DecisionTreeClassifier(random_state=42), 
                              param_distributions=dt_params, 
                              n_iter=100, 
                              cv=4, 
                              random_state=42)
dt_search.fit(X_train_processed, y_train)

rf_search = RandomizedSearchCV(RandomForestClassifier(random_state=42), 
                              param_distributions=rf_params, 
                              n_iter=100, 
                              cv=4, 
                              random_state=42)
rf_search.fit(X_train_processed, y_train)

ada_dt_search = RandomizedSearchCV(AdaBoostClassifier(base_estimator=DecisionTreeClassifier(), random_state=42), 
                                  param_distributions=ada_params, 
                                  n_iter=100, 
                                  cv=4, 
                                  random_state=42)
ada_dt_search.fit(X_train_processed, y_train)

# 3. Affichage des meilleurs paramètres
print("\nMeilleurs paramètres pour Arbre de Décision:", dt_search.best_params_)
print("Meilleurs paramètres pour Forêt Aléatoire:", rf_search.best_params_)
print("Meilleurs paramètres pour AdaBoost:", ada_dt_search.best_params_)

# 4. Ré-entraînement avec les meilleurs paramètres
dt_best = dt_search.best_estimator_
rf_best = rf_search.best_estimator_
ada_dt_best = ada_dt_search.best_estimator_

dt_best_pred = dt_best.predict(X_test_processed)
rf_best_pred = rf_best.predict(X_test_processed)
ada_dt_best_pred = ada_dt_best.predict(X_test_processed)

# 5. Évaluation des modèles optimisés
print("\nÉvaluation des modèles optimisés:")
evaluate_model(y_test, dt_best_pred, "Arbre de Décision optimisé")
evaluate_model(y_test, rf_best_pred, "Forêt Aléatoire optimisée")
evaluate_model(y_test, ada_dt_best_pred, "AdaBoost optimisé")

# 6. Comparaison des performances
models = ['Arbre de Décision', 'Forêt Aléatoire', 'AdaBoost']
metrics = ['Accuracy', 'Precision', 'Recall', 'F1-score']

# Création d'un graphique comparatif
plt.figure(figsize=(12, 6))
x = np.arange(len(models))
width = 0.2

for i, metric in enumerate(metrics):
    values = [accuracy_score(y_test, dt_pred) if metric == 'Accuracy' else
              precision_score(y_test, dt_pred, average='weighted') if metric == 'Precision' else
              recall_score(y_test, dt_pred, average='weighted') if metric == 'Recall' else
              f1_score(y_test, dt_pred, average='weighted') for dt_pred in [dt_pred, rf_pred, ada_dt_pred]]
    
    plt.bar(x + i*width, values, width, label=metric)

plt.xlabel('Modèles')
plt.ylabel('Score')
plt.title('Comparaison des performances des modèles')
plt.xticks(x + width*1.5, models)
plt.legend()
plt.tight_layout()
plt.show() 