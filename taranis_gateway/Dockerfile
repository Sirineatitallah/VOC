# Utilise une image Python officielle
FROM python:3.11-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le reste du code
COPY . .

# Exposer un port (par exemple, 5000 si tu utilises Flask)
EXPOSE 5001

# Commande pour démarrer l'application (à adapter selon ton framework)
CMD ["python", "app.py"]
