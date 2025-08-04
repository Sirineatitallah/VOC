# 🐳 Dockerisation du projet VOC Platform

Ce projet a été dockerisé pour faciliter le développement et le déploiement.

## 📋 Prérequis

- Docker
- Docker Compose

## 🚀 Utilisation

### Développement

Pour lancer l'environnement de développement complet (frontend + backend) :

```bash
docker-compose --profile dev --profile backend up
```

Ou seulement le frontend :

```bash
docker-compose --profile dev up
```

### Production

Pour lancer l'application en production :

```bash
docker-compose --profile prod up --build
```

## 🌐 Accès aux services

- **Frontend (développement)** : http://localhost:5173
- **Backend Express** : http://localhost:5174
- **Frontend (production)** : http://localhost:80

## 🔧 Commandes utiles

### Build des images

```bash
# Build pour développement
docker build --target development -t voc-frontend:dev .

# Build pour production
docker build --target production -t voc-frontend:prod .
```

### Nettoyage

```bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer les conteneurs + volumes
docker-compose down -v

# Supprimer les images
docker rmi voc-front-voc-frontend-dev voc-front-voc-backend
```

### Logs

```bash
# Voir les logs du frontend
docker-compose logs voc-frontend-dev

# Voir les logs du backend
docker-compose logs voc-backend

# Suivre les logs en temps réel
docker-compose logs -f voc-frontend-dev
```

## 📁 Structure des fichiers Docker

- `Dockerfile` : Configuration multi-stage pour build et production
- `docker-compose.yml` : Orchestration des services
- `nginx.conf` : Configuration nginx pour la production
- `.dockerignore` : Fichiers exclus du contexte Docker

## 🔍 Dépannage

### Port déjà utilisé

Si vous obtenez une erreur "port is already allocated", arrêtez les services qui utilisent ces ports :

```bash
# Voir les processus utilisant les ports
sudo lsof -i :5173
sudo lsof -i :5174
sudo lsof -i :80

# Tuer les processus si nécessaire
sudo kill -9 <PID>
```

### Rebuild après modification

Si vous modifiez le Dockerfile ou les dépendances :

```bash
docker-compose --profile dev up --build
```

### Accès au conteneur

```bash
# Accéder au conteneur frontend
docker exec -it voc-frontend-dev sh

# Accéder au conteneur backend
docker exec -it voc-backend sh
```

## 🏗️ Architecture

- **Frontend** : React + Vite (port 5173)
- **Backend** : Express.js (port 5174)
- **Production** : Nginx (port 80)
- **Réseau** : Bridge isolé `voc-network`

## 🔒 Sécurité

- Headers de sécurité configurés dans nginx
- Isolation réseau entre les services
- Pas d'exposition des ports sensibles 