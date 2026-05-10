#!/bin/bash

# Arrêter le script en cas d'erreur
set -e

echo "🚀 Initialisation de l'environnement TCHOUA APP..."

# 1. Création des dossiers nécessaires
echo "📁 Création du dossier pour les certificats SSL (nginx/certs)..."
mkdir -p nginx/certs

# 2. Génération du certificat SSL auto-signé (si inexistant)
if [ ! -f nginx/certs/localhost.crt ]; then
    echo "🔐 Génération d'un certificat SSL auto-signé pour localhost..."
    # Utilisation de //CN=localhost pour éviter les erreurs de chemin sur Git Bash (Windows)
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/certs/localhost.key \
        -out nginx/certs/localhost.crt \
        -subj "//CN=localhost"
    echo "✅ Certificat généré avec succès."
else
    echo "✅ Certificat SSL déjà existant."
fi

# 3. Lancement de Docker Compose
echo "🐳 Lancement de l'infrastructure Docker..."
docker-compose up --build -d

echo "✨ Initialisation terminée !"
echo "🌐 L'application est disponible de manière sécurisée sur : https://localhost"