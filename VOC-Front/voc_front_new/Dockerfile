# Dockerfile pour l'application VOC Platform
FROM node:18-alpine AS base

# Étape de build
FROM base AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Étape de production
FROM nginx:alpine AS production

# Copier les fichiers buildés depuis l'étape builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]

# Étape de développement
FROM base AS development

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (incluant devDependencies)
RUN npm ci

# Copier le code source
COPY . .

# Exposer les ports pour le développement
EXPOSE 5173 5174

# Démarrer en mode développement
CMD ["npm", "run", "dev"] 